import type { FastifyInstance, FastifyReply } from "fastify";
import type { BackendEnv } from "../config/env.js";
import type { ApiErrorResponse } from "../types/api.js";
import type { AiReviewSuccessResponse } from "../types/aiReview.js";
import { runAiReview } from "../services/aiReviewService.js";
import { validateAiReviewInput } from "../services/aiReviewValidation.js";

type AiReviewRouteReply = AiReviewSuccessResponse | ApiErrorResponse;

const requestTimestamps: number[] = [];

function error(reply: FastifyReply, statusCode: number, code: string, message: string, details?: unknown) {
  const body: ApiErrorResponse = {
    ok: false,
    error: details === undefined
      ? { code, message }
      : { code, message, details }
  };

  return reply.code(statusCode).send(body);
}

function payloadSizeBytes(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function rateLimitExceeded(limit: number) {
  const now = Date.now();
  const windowStart = now - 60_000;

  while (requestTimestamps.length && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= limit) {
    return true;
  }

  requestTimestamps.push(now);
  return false;
}

export async function registerAiReviewRoutes(app: FastifyInstance, env: BackendEnv) {
  app.post<{ Reply: AiReviewRouteReply }>("/api/ai-review", async (request, reply) => {
    const body = request.body as { consent?: unknown; input?: unknown } | undefined;

    if (!body || body.consent !== true) {
      return error(
        reply,
        400,
        "AI_REVIEW_CONSENT_REQUIRED",
        "AI review requires explicit consent before structured evidence is sent."
      );
    }

    if (payloadSizeBytes(body.input) > env.aiReviewMaxInputBytes) {
      return error(
        reply,
        413,
        "AI_REVIEW_INPUT_TOO_LARGE",
        "AI review input exceeds the configured structured evidence size limit."
      );
    }

    if (!validateAiReviewInput(body.input)) {
      return error(
        reply,
        400,
        "AI_REVIEW_INVALID_INPUT",
        "AI review input must match the structured evidence contract."
      );
    }

    if (rateLimitExceeded(env.aiReviewRateLimitPerMinute)) {
      return error(
        reply,
        429,
        "AI_REVIEW_RATE_LIMITED",
        "AI review rate limit exceeded. Try again later."
      );
    }

    const result = await runAiReview(body.input, env);
    return reply.code(result.ok ? 200 : 503).send(result);
  });
}
