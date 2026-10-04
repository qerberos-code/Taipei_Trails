let sdk;

export async function startTracing() {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) return;
  const [{ NodeSDK }, { LangfuseSpanProcessor }] = await Promise.all([
    import('@opentelemetry/sdk-node'), import('@langfuse/otel'),
  ]);
  sdk = new NodeSDK({ spanProcessors: [new LangfuseSpanProcessor()] });
  sdk.start();
}

export async function requestCallbacks() {
  if (!sdk) return [];
  const { CallbackHandler } = await import('@langfuse/langchain');
  return [new CallbackHandler({ tags: ['taipei-trail-finder'] })];
}

export async function stopTracing() {
  await sdk?.shutdown();
}
