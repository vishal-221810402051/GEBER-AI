import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import type { BackendEnv } from "../config/env.js";

const baseEnv: BackendEnv = {
  port: 8787,
  corsOrigin: "http://localhost:5173",
  openAiModel: "gpt-5.5",
  aiReviewMaxInputBytes: 120000,
  aiReviewRateLimitPerMinute: 10,
  nodeEnv: "test"
};

const validInput = {
  project: {
    generatedAt: new Date().toISOString()
  },
  fileSummary: {
    totalFiles: 0,
    recognizedFiles: 0,
    unsupportedFiles: 0,
    categories: [],
    missingRecommendedFiles: []
  },
  parserStatus: [],
  evidenceSummary: [],
  risks: [],
  recommendations: [],
  missingDataWarnings: []
};

describe("AI review route", () => {
  it("reports AI review configured state in capabilities", async () => {
    const app = await buildApp(baseEnv);
    const response = await app.inject({ method: "GET", url: "/api/capabilities" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json().capabilities.aiReview).toBe(true);
    expect(response.json().capabilities.aiReviewConfigured).toBe(false);
  });

  it("requires explicit consent", async () => {
    const app = await buildApp(baseEnv);
    const response = await app.inject({
      method: "POST",
      url: "/api/ai-review",
      payload: { consent: false, input: validInput }
    });
    await app.close();

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("AI_REVIEW_CONSENT_REQUIRED");
  });

  it("rejects invalid structured evidence", async () => {
    const app = await buildApp(baseEnv);
    const response = await app.inject({
      method: "POST",
      url: "/api/ai-review",
      payload: { consent: true, input: { project: {} } }
    });
    await app.close();

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("AI_REVIEW_INVALID_INPUT");
  });

  it("rejects oversized input", async () => {
    const app = await buildApp({ ...baseEnv, aiReviewMaxInputBytes: 20 });
    const response = await app.inject({
      method: "POST",
      url: "/api/ai-review",
      payload: { consent: true, input: validInput }
    });
    await app.close();

    expect(response.statusCode).toBe(413);
    expect(response.json().error.code).toBe("AI_REVIEW_INPUT_TOO_LARGE");
  });

  it("returns not configured without an API key", async () => {
    const app = await buildApp(baseEnv);
    const response = await app.inject({
      method: "POST",
      url: "/api/ai-review",
      payload: { consent: true, input: validInput }
    });
    await app.close();

    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe("AI_REVIEW_NOT_CONFIGURED");
  });
});
