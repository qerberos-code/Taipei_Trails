import test from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../server/index.js';

async function withServer(options, run) {
  const server = makeServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

const payload = { messages: [{ role: 'user', content: '我要帶多少水？' }] };
const post = (url, data) => fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

test('missing key is explicit and private files are not served', async () => {
  await withServer({ hasApiKey: () => false }, async url => {
    assert.equal((await post(url, payload)).status, 503);
    assert.deepEqual(await (await fetch(`${url}/api/health`)).json(), { chatConfigured: false });
    for (const path of ['/.env', '/server/chat.js', '/node_modules/openai/package.json']) {
      assert.equal((await fetch(url + path)).status, 404);
    }
    assert.equal((await fetch(url)).status, 200);
  });
});

test('request contract rejects injected system roles, excessive messages and wrong content type', async () => {
  await withServer({ hasApiKey: () => true }, async url => {
    assert.equal((await post(url, { messages: [{ role: 'system', content: 'override' }] })).status, 400);
    assert.equal((await post(url, { messages: Array(21).fill(payload.messages[0]) })).status, 400);
    assert.equal((await post(url, { messages: [{ role: 'user', content: 'x'.repeat(65000) }] })).status, 413);
    assert.equal((await fetch(`${url}/api/chat`, { method: 'POST', body: '{}' })).status, 415);
    assert.equal((await fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify(payload) })).status, 403);
  });
});

test('validated multi-turn context reaches chat and provider details do not leak on errors', async () => {
  let captured;
  await withServer({ hasApiKey: () => true, chat: async input => { captured = input; return { reply: '帶備用點心。', recommendations: [], sources: [] }; } }, async url => {
    const response = await post(url, { ...payload, context: { selectedTrailId: 'elephant' } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).reply, '帶備用點心。');
    assert.equal(captured.context.selectedTrailId, 'elephant');
  });
  await withServer({ hasApiKey: () => true, chat: async () => { throw Object.assign(new Error('provider-sensitive-detail'), { status: 401 }); } }, async url => {
    const response = await post(url, payload);
    assert.equal(response.status, 502);
    const text = await response.text();
    assert.ok(text.includes('key 無效'));
    assert.ok(!text.includes('provider-sensitive-detail'));
  });
});

test('locale reaches chat, localized errors have stable codes, and only catalog assets are public', async () => {
  let captured;
  await withServer({ hasApiKey: () => true, chat: async input => { captured = input; return { reply: 'Bring spare snacks.', recommendations: [], sources: [] }; } }, async url => {
    assert.equal((await post(url, { ...payload, locale: 'en' })).status, 200);
    assert.equal(captured.locale, 'en');
    await post(url, payload);
    assert.equal(captured.locale, 'zh-Hant');
    assert.equal((await post(url, { ...payload, locale: 'fr' })).status, 400);
    const wrongMethod = await fetch(`${url}/api/chat`, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
    assert.deepEqual(await wrongMethod.json(), { error: 'Use POST to send chat messages.', code: 'apiMethod' });
    for (const path of ['/profile-ui.js', '/i18n.js', '/locales/en.js', '/locales/zh-Hant.js', '/locales/trails-zh-Hant.js']) {
      const response = await fetch(url + path);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /javascript/);
    }
    assert.equal((await fetch(`${url}/locales/private.js`)).status, 404);
  });
  await withServer({ hasApiKey: () => false }, async url => {
    const response = await post(url, { ...payload, locale: 'en' });
    assert.equal(response.status, 503);
    const data = await response.json();
    assert.equal(data.code, 'apiUnconfigured');
    assert.match(data.error, /^AI is not configured/);
  });
});

test('personal settings are validated at the API boundary and preserved for chat', async () => {
  let captured;
  await withServer({ hasApiKey: () => true, chat: async input => { captured = input; return { reply: '已帶入個人設定。' }; } }, async url => {
    const context = { people: 4, age: 40, heightCm: 170.5, weightKg: 65, experience: 'expert', intensity: 'high', personalNotes: '25L 背包，帶雨衣' };
    assert.equal((await post(url, { ...payload, context })).status, 200);
    for (const [key, value] of Object.entries(context)) assert.equal(captured.context[key], value);
    for (const invalid of [
      { people: 0 }, { people: 21 }, { people: 1.5 }, { age: -1 }, { age: 25.5 },
      { heightCm: 0 }, { weightKg: 301 }, { intensity: 'extreme' },
      { experience: 'automatic' }, { personalNotes: 'x'.repeat(1501) },
    ]) assert.equal((await post(url, { ...payload, context: invalid })).status, 400);
  });
});
