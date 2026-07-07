import type { AnalysisConfidence, AnalysisEvidence, AnalysisIssue, AnalysisSeverity } from "../../../domain/analysis";

export function evidence(
  source: AnalysisEvidence["source"],
  detail: string,
  confidence: AnalysisConfidence
): AnalysisEvidence {
  return { source, detail, confidence };
}

export function issue(input: {
  id: string;
  type: AnalysisIssue["type"];
  title: string;
  severity: AnalysisSeverity;
  confidence: AnalysisConfidence;
  affectedComponent?: string;
  affectedNet?: string;
  relatedComponents?: readonly string[];
  evidence: readonly AnalysisEvidence[];
  whyItMatters: string;
  recommendation: string;
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}): AnalysisIssue {
  return {
    id: input.id,
    type: input.type,
    title: input.title,
    severity: input.severity,
    confidence: input.confidence,
    affectedComponent: input.affectedComponent,
    affectedNet: input.affectedNet,
    relatedComponents: input.relatedComponents ?? [],
    evidence: input.evidence,
    whyItMatters: input.whyItMatters,
    recommendation: input.recommendation,
    limitations: input.limitations,
    requiredFilesForStrongerValidation: input.requiredFilesForStrongerValidation,
    fullValidationComplete: false
  };
}
