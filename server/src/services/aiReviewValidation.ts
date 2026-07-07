import type { AiReviewInput, AiReviewResult } from "../types/aiReview.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasArray(record: Record<string, unknown>, key: string) {
  return Array.isArray(record[key]);
}

function hasString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === "string";
}

function hasNumber(record: Record<string, unknown>, key: string) {
  return typeof record[key] === "number" && Number.isFinite(record[key]);
}

export function validateAiReviewInput(value: unknown): value is AiReviewInput {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.project) || !hasString(value.project, "generatedAt")) {
    return false;
  }

  if (!isRecord(value.fileSummary)) {
    return false;
  }

  return (
    hasNumber(value.fileSummary, "totalFiles") &&
    hasNumber(value.fileSummary, "recognizedFiles") &&
    hasNumber(value.fileSummary, "unsupportedFiles") &&
    hasArray(value.fileSummary, "categories") &&
    hasArray(value.fileSummary, "missingRecommendedFiles") &&
    hasArray(value, "parserStatus") &&
    hasArray(value, "evidenceSummary") &&
    hasArray(value, "risks") &&
    hasArray(value, "recommendations") &&
    hasArray(value, "missingDataWarnings")
  );
}

export function validateAiReviewResult(value: unknown): value is AiReviewResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "summary") &&
    isRecord(value.engineeringReadiness) &&
    hasString(value.engineeringReadiness, "label") &&
    hasString(value.engineeringReadiness, "explanation") &&
    hasArray(value, "topRisks") &&
    hasArray(value, "questionsForEngineer") &&
    hasArray(value, "nextActions") &&
    hasArray(value, "confidenceNotes") &&
    hasString(value, "reportNarrative") &&
    hasArray(value, "limitations")
  );
}
