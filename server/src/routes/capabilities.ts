import type { FastifyInstance } from "fastify";
import type { CapabilitiesResponse } from "../types/api.js";

export async function registerCapabilitiesRoutes(app: FastifyInstance) {
  app.get<{ Reply: CapabilitiesResponse }>("/api/capabilities", async () => ({
    ok: true,
    capabilities: {
      backend: true,
      aiReview: false,
      fileUpload: false,
      persistence: false,
      authentication: false,
      deterministicFrontendPipeline: true
    },
    message:
      "Backend foundation is available. AI review, server upload, persistence, and authentication are not implemented yet."
  }));
}
