// Shared adapter: reuses the app's Node request handler (server/index.js) inside Vercel Functions.
import { makeServer } from '../server/index.js';
import { startTracing } from '../server/tracing.js';

await startTracing();
export default makeServer().listeners('request')[0];
