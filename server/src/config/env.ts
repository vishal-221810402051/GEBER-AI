import dotenv from "dotenv";

dotenv.config();

export type BackendEnv = Readonly<{
  port: number;
  corsOrigin: string;
  hasFutureOpenAiKey: boolean;
  nodeEnv: string;
}>;

function parsePort(value: string | undefined): number {
  const parsed = Number(value ?? "8787");

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return parsed;
}

export function loadEnv(): BackendEnv {
  return {
    port: parsePort(process.env.PORT),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    hasFutureOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    nodeEnv: process.env.NODE_ENV || "development"
  };
}
