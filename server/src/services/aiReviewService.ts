import type { BackendEnv } from "../config/env.js";
import type { ApiErrorResponse } from "../types/api.js";
import type { AiReviewInput, AiReviewSuccessResponse } from "../types/aiReview.js";
import { requestOpenAiReview } from "./openaiClient.js";

export type AiReviewServiceResponse = AiReviewSuccessResponse | ApiErrorResponse;

export async function runAiReview(
  input: AiReviewInput,
  env: BackendEnv
): Promise<AiReviewServiceResponse> {
  const providerResult = await requestOpenAiReview(input, env);

  if (!providerResult.ok) {
    return {
      ok: false,
      error: {
        code: providerResult.code,
        message: providerResult.message
      }
    };
  }

  return {
    ok: true,
    result: providerResult.result,
    meta: {
      model: providerResult.model,
      generatedAt: new Date().toISOString(),
      inputMode: "structured_evidence_only"
    }
  };
}
