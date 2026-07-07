import dotenv from "dotenv";

dotenv.config();

export type BackendEnv = Readonly<{
  port: number;
  corsOrigin: string;
  openAiApiKey?: string;
  openAiModel: string;
  aiReviewMaxInputBytes: number;
  aiReviewRateLimitPerMinute: number;
  nodeEnv: string;
}>;

function parsePort(value: string | undefined): number {
  const parsed = Number(value ?? "8787");

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return parsed;
}

function parsePositiveInteger(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

export function loadEnv(): BackendEnv {
  return {
    port: parsePort(process.env.PORT),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    openAiApiKey: process.env.OPENAI_API_KEY || undefined,
    openAiModel: process.env.OPENAI_MODEL || "gpt-5.5",
    aiReviewMaxInputBytes: parsePositiveInteger(
      process.env.AI_REVIEW_MAX_INPUT_BYTES,
      120000,
      "AI_REVIEW_MAX_INPUT_BYTES"
    ),
    aiReviewRateLimitPerMinute: parsePositiveInteger(
      process.env.AI_REVIEW_RATE_LIMIT_PER_MINUTE,
      10,
      "AI_REVIEW_RATE_LIMIT_PER_MINUTE"
    ),
    nodeEnv: process.env.NODE_ENV || "development"
  };
}
