import type { FastifyInstance } from "fastify";
import type { HealthResponse } from "../types/api.js";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get<{ Reply: HealthResponse }>("/health", async () => ({
    ok: true,
    service: "geber-ai-backend",
    status: "healthy",
    timestamp: new Date().toISOString()
  }));
}
