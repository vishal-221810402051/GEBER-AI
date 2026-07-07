import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { BackendEnv } from "../config/env.js";
import type { AiReviewInput, AiReviewResult } from "../types/aiReview.js";
import { aiReviewResultJsonSchema } from "./aiReviewSchema.js";
import { validateAiReviewResult } from "./aiReviewValidation.js";

export type OpenAiReviewResult =
  | {
      ok: true;
      result: AiReviewResult;
      model: string;
    }
  | {
      ok: false;
      code: "AI_REVIEW_NOT_CONFIGURED" | "AI_REVIEW_PROVIDER_ERROR";
      message: string;
    };

const systemInstructions = `You are GEBER AI Review, an evidence-bound PCB engineering review assistant.

Use only the provided JSON evidence.
Do not invent components, nets, files, datasheet facts, measurements, or validation results.
Separate deterministic facts from engineering inferences.
If evidence is missing, say data is missing.
Never claim the board is safe, validated, manufacturable, compliant, or production-ready.
Never replace datasheet review, DFM review, electrical validation, or professional engineering judgement.
Every risk explanation and next action must cite evidenceIds when available.
Return only JSON matching the requested schema.`;

export async function requestOpenAiReview(
  input: AiReviewInput,
  env: BackendEnv
): Promise<OpenAiReviewResult> {
  if (!env.openAiApiKey) {
    return {
      ok: false,
      code: "AI_REVIEW_NOT_CONFIGURED",
      message: "AI review is not configured. Set OPENAI_API_KEY on the backend to enable it."
    };
  }

  const client = new OpenAI({ apiKey: env.openAiApiKey });

  try {
    const response = await client.responses.create({
      model: env.openAiModel as ResponseCreateParamsNonStreaming["model"],
      instructions: systemInstructions,
      input: JSON.stringify({
        inputMode: "structured_evidence_only",
        aiMustNotValidate: true,
        projectEvidence: input
      }),
      max_output_tokens: 2400,
      parallel_tool_calls: false,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "geber_ai_review_result",
          description: "Evidence-bound engineering interpretation result.",
          schema: aiReviewResultJsonSchema,
          strict: true
        }
      }
    });

    const parsed = JSON.parse(response.output_text) as unknown;

    if (!validateAiReviewResult(parsed)) {
      return {
        ok: false,
        code: "AI_REVIEW_PROVIDER_ERROR",
        message: "AI review provider returned an invalid structured result."
      };
    }

    return {
      ok: true,
      result: parsed,
      model: env.openAiModel
    };
  } catch {
    return {
      ok: false,
      code: "AI_REVIEW_PROVIDER_ERROR",
      message: "AI review provider request failed."
    };
  }
}
