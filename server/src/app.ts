import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { BackendEnv } from "./config/env.js";
import { registerErrorHandlers } from "./middleware/errorHandler.js";
import { registerCapabilitiesRoutes } from "./routes/capabilities.js";
import { registerHealthRoutes } from "./routes/health.js";

const maxBodyBytes = 1_000_000;

function registerLocalCors(app: FastifyInstance, env: BackendEnv) {
  app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", env.corsOrigin);
    reply.header("Vary", "Origin");
    reply.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }

    return undefined;
  });
}

export async function buildApp(env: BackendEnv) {
  const app = Fastify({
    bodyLimit: maxBodyBytes,
    logger: env.nodeEnv === "development"
  });

  registerLocalCors(app, env);
  registerErrorHandlers(app);
  await registerHealthRoutes(app);
  await registerCapabilitiesRoutes(app);

  return app;
}
