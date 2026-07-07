import type { AiReviewInput } from "./aiReviewTypes";
import type { BackendCapabilitiesResponse } from "../backend/apiClient";

export type AiBackendState =
  | { status: "checking"; message: string }
  | { status: "offline"; message: string }
  | { status: "online"; capabilities: BackendCapabilitiesResponse["capabilities"]; message: string };

const errorMessages: Record<string, string> = {
  AI_REVIEW_CONSENT_REQUIRED: "Confirm consent before sending structured evidence to the backend.",
  AI_REVIEW_NOT_CONFIGURED:
    "AI Review is not configured. Add OPENAI_API_KEY to the backend environment to enable server-side AI Review.",
  AI_REVIEW_INPUT_TOO_LARGE:
    "The structured evidence package is too large for the configured AI Review limit.",
  AI_REVIEW_INVALID_INPUT:
    "The structured evidence package did not match the AI Review contract.",
  AI_REVIEW_PROVIDER_ERROR:
    "The AI provider request failed. The deterministic report is still available.",
  AI_REVIEW_RATE_LIMITED:
    "AI Review rate limit reached. Wait a moment before trying again.",
  BACKEND_UNAVAILABLE:
    "Backend unavailable. Start the GEBER AI backend to enable AI Review."
};

export function getAiReviewErrorMessage(code: string, fallback: string) {
  return errorMessages[code] ?? fallback;
}

export function summarizeAiReviewInput(input: AiReviewInput) {
  return [
    { label: "Files summary", value: input.fileSummary.totalFiles },
    { label: "Parser status", value: input.parserStatus.length },
    { label: "Evidence items", value: input.evidenceSummary.length },
    { label: "Risks", value: input.risks.length },
    { label: "Recommendations", value: input.recommendations.length },
    { label: "Missing-data warnings", value: input.missingDataWarnings.length },
    { label: "Firmware summary", value: input.firmwareSummary?.available ? "available" : "limited" },
    { label: "Report confidence", value: input.reportSummary?.confidenceScore ?? "unknown" }
  ];
}
