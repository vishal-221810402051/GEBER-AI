import type { FastifyInstance } from "fastify";
import type { BackendEnv } from "../config/env.js";
import type { CapabilitiesResponse } from "../types/api.js";

export async function registerCapabilitiesRoutes(app: FastifyInstance, env: BackendEnv) {
  app.get<{ Reply: CapabilitiesResponse }>("/api/capabilities", async () => ({
    ok: true,
    capabilities: {
      backend: true,
      aiReview: true,
      aiReviewConfigured: Boolean(env.openAiApiKey),
      fileUpload: false,
      persistence: false,
      authentication: false,
      deterministicFrontendPipeline: true
    },
    message:
      "AI review endpoint is available for structured evidence only. Server upload, persistence, and authentication are not implemented yet."
  }));
}
