import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { translate } from '../i18n.js';
import { chatRequestSchema } from './contracts.js';
import { startTracing, requestCallbacks, stopTracing } from './tracing.js';

const root = new URL('../', import.meta.url);
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/trails.js', ['trails.js', 'text/javascript; charset=utf-8']],
  ['/chat-ui.js', ['chat-ui.js', 'text/javascript; charset=utf-8']],
  ['/profile-ui.js', ['profile-ui.js', 'text/javascript; charset=utf-8']],
  ...['i18n.js', 'locales/en.js', 'locales/zh-Hant.js', 'locales/trails-zh-Hant.js'].map(path => [`/${path}`, [path, 'text/javascript; charset=utf-8']]),
]);

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function makeServer({ chat, hasApiKey = () => Boolean(process.env.OPENAI_API_KEY) } = {}) {
  return createServer(async (req, res) => {
    let locale = /^en(?:[-,;]|$)/i.test(req.headers['accept-language'] ?? '') ? 'en' : 'zh-Hant';
    const fail = (status, code) => json(res, status, { error: translate(code, {}, locale), code });
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/favicon.ico' && req.method === 'GET') {
        res.writeHead(204); return res.end();
      }
      if (pathname === '/api/health' && req.method === 'GET') {
        return json(res, 200, { chatConfigured: hasApiKey() });
      }
      if (pathname === '/api/chat') {
        if (req.method !== 'POST') return fail(405, 'apiMethod');
        // Local server accepts only same-origin JSON requests; no public CORS API.
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) {
          return fail(403, 'apiOrigin');
        }
        if (!req.headers['content-type']?.startsWith('application/json')) return fail(415, 'apiJson');
        let body = '';
        for await (const chunk of req) {
          body += chunk.toString();
          if (Buffer.byteLength(body) > 64000) return fail(413, 'apiTooLong');
        }
        let parsed;
        try { parsed = JSON.parse(body); } catch { return fail(400, 'apiMalformed'); }
        if (parsed?.locale === 'en' || parsed?.locale === 'zh-Hant') locale = parsed.locale;
        const input = chatRequestSchema.safeParse(parsed);
        if (!input.success) return fail(400, 'apiInvalid');
        if (!hasApiKey()) return fail(503, 'apiUnconfigured');
        const signal = AbortSignal.timeout(60000);
        const callbacks = await requestCallbacks();
        const runChat = chat ?? (await import('./chat.js')).chatWithTrails;
        try {
          return json(res, 200, await runChat(input.data, { callbacks, signal }));
        } catch (error) {
          const status = error.status ?? error.cause?.status;
          // Do not log provider bodies, credentials, or users' chat content.
          console.error('Chat failed:', error.name, status ?? 'unknown');
          const code = status === 401 ? 'apiKey'
            : status === 429 ? 'apiRate'
            : signal.aborted ? 'timeout' : 'chatUnavailable';
          return fail(502, code);
        }
      }
      const asset = staticFiles.get(pathname);
      if (!asset || !['GET', 'HEAD'].includes(req.method)) return fail(404, 'apiNotFound');
      const contents = await readFile(new URL(asset[0], root));
      res.writeHead(200, { 'Content-Type': asset[1], 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : contents);
    } catch {
      if (!res.headersSent) fail(500, 'apiServer');
      else res.end();
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startTracing();
  const server = makeServer();
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3000);
  server.on('error', async error => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use. Stop the existing server or choose another PORT in .env.`
      : `Unable to start server (${error.code || error.name}). Check HOST and PORT in .env.`);
    await stopTracing(); process.exit(1);
  });
  server.listen(port, host, () => console.log(`Taipei Trail Finder: http://${host}:${port}`));
  for (const event of ['SIGINT', 'SIGTERM']) process.on(event, async () => {
    server.close(); await stopTracing(); process.exit(0);
  });
}
