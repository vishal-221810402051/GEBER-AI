import { describe, expect, it } from "vitest";
import {
  getAiReviewErrorMessage,
  summarizeAiReviewInput
} from "../features/ai/aiReviewPanelState";
import type { AiReviewInput } from "../features/ai/aiReviewTypes";

const minimalInput: AiReviewInput = {
  project: {
    generatedAt: new Date().toISOString()
  },
  fileSummary: {
    totalFiles: 2,
    recognizedFiles: 1,
    unsupportedFiles: 1,
    categories: [{ category: "kicad-pcb", count: 1 }],
    missingRecommendedFiles: ["schematic"]
  },
  parserStatus: [{ parser: "PCB parser", status: "complete", filesInvolved: 1, diagnosticsCount: 0 }],
  evidenceSummary: [{ evidenceId: "ev-1", title: "Evidence", source: "direct", confidence: "high", detail: "Detected" }],
  risks: [{ riskId: "risk-1", severity: "high", title: "Risk", description: "Review needed", evidenceIds: ["ev-1"] }],
  recommendations: [{ recommendationId: "rec-1", priority: "high", title: "Action", action: "Review", evidenceIds: ["ev-1"] }],
  missingDataWarnings: [{ id: "missing-1", severity: "medium", message: "Missing schematic" }],
  reportSummary: {
    available: true,
    confidenceScore: 25,
    sectionCount: 3,
    limitationCount: 2
  }
};

describe("AI review panel state helpers", () => {
  it("maps known backend error codes to friendly messages", () => {
    expect(getAiReviewErrorMessage("AI_REVIEW_NOT_CONFIGURED", "fallback")).toContain("OPENAI_API_KEY");
    expect(getAiReviewErrorMessage("UNKNOWN", "fallback")).toBe("fallback");
  });

  it("summarizes the structured evidence package without exposing raw data", () => {
    const summary = summarizeAiReviewInput(minimalInput);

    expect(summary.find((item) => item.label === "Evidence items")?.value).toBe(1);
    expect(summary.find((item) => item.label === "Risks")?.value).toBe(1);
    expect(JSON.stringify(summary)).not.toContain("Review needed");
  });
});
