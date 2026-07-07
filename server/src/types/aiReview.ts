export type AiReviewSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type AiReviewConfidence = "high" | "medium" | "low" | "unknown";
export type AiReviewParserStatus = "not_run" | "complete" | "warning" | "error" | "not_applicable";

export type AiReviewInput = {
  project: {
    name?: string;
    source?: string;
    generatedAt: string;
  };
  fileSummary: {
    totalFiles: number;
    recognizedFiles: number;
    unsupportedFiles: number;
    categories: Array<{
      category: string;
      count: number;
    }>;
    missingRecommendedFiles: string[];
  };
  parserStatus: Array<{
    parser: string;
    status: AiReviewParserStatus;
    filesInvolved: number;
    diagnosticsCount: number;
    summary?: string;
  }>;
  evidenceSummary: Array<{
    evidenceId: string;
    title: string;
    source: string;
    confidence: AiReviewConfidence;
    detail: string;
  }>;
  risks: Array<{
    riskId: string;
    severity: AiReviewSeverity;
    title: string;
    description: string;
    evidenceIds: string[];
    recommendation?: string;
  }>;
  recommendations: Array<{
    recommendationId: string;
    priority: AiReviewSeverity;
    title: string;
    action: string;
    evidenceIds: string[];
  }>;
  missingDataWarnings: Array<{
    id: string;
    severity: AiReviewSeverity;
    message: string;
  }>;
  firmwareSummary?: {
    available: boolean;
    mcuCandidates: number;
    pinMappings: number;
    peripherals: string[];
    limitations: string[];
  };
  reportSummary?: {
    available: boolean;
    confidenceScore?: number;
    sectionCount?: number;
    limitationCount?: number;
  };
};

export type AiReviewResult = {
  summary: string;
  engineeringReadiness: {
    label: "insufficient_data" | "early_review" | "reviewable" | "needs_engineering_validation";
    explanation: string;
  };
  topRisks: Array<{
    riskId: string;
    title: string;
    priority: AiReviewSeverity;
    evidenceIds: string[];
    explanation: string;
    recommendedAction: string;
    confidence: "high" | "medium" | "low";
  }>;
  questionsForEngineer: string[];
  nextActions: Array<{
    title: string;
    reason: string;
    evidenceIds: string[];
    priority: AiReviewSeverity;
  }>;
  confidenceNotes: string[];
  reportNarrative: string;
  limitations: string[];
};

export type AiReviewRequest = {
  consent: true;
  input: AiReviewInput;
};

export type AiReviewSuccessResponse = {
  ok: true;
  result: AiReviewResult;
  meta: {
    model: string;
    generatedAt: string;
    inputMode: "structured_evidence_only";
  };
};
