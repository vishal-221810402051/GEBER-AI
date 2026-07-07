import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();
const app = await buildApp(env);

try {
  await app.listen({ port: env.port, host: "127.0.0.1" });
  app.log.info(
    {
      port: env.port,
      corsOrigin: env.corsOrigin,
      futureOpenAiKeyConfigured: env.hasFutureOpenAiKey
    },
    "GEBER AI backend foundation started"
  );
} catch (error) {
  app.log.error(error, "Failed to start GEBER AI backend foundation");
  process.exit(1);
}
