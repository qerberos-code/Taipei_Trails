// Shared adapter: reuses the app's Node request handler (server/index.js) inside Vercel Functions.
// chat.js is imported statically so Vercel bundles it and its LangChain/OpenAI dependencies;
// server/index.js only loads it via dynamic import(), which the Vercel bundler can miss.
import { makeServer } from '../server/index.js';
import { chatWithTrails } from '../server/chat.js';
import { startTracing } from '../server/tracing.js';

await startTracing();
export default makeServer({ chat: chatWithTrails }).listeners('request')[0];
