import type { AnalysisIssue } from "../../../domain/analysis";
import type { ComponentProximityResult, PlacementFinding, PlacementRiskCategory } from "../../../domain/placement";
import { issue } from "../shared/analysisEvidence";

export function placementFinding(input: {
  id: string;
  category: PlacementRiskCategory;
  title: string;
  severity: AnalysisIssue["severity"];
  proximity: ComponentProximityResult;
  recommendation: string;
}): PlacementFinding {
  return {
    ...issue({
      id: input.id,
      type: "analysis-limitation",
      title: input.title,
      severity: input.severity,
      confidence: input.proximity.confidence,
      affectedComponent: input.proximity.sourceReference,
      relatedComponents: [input.proximity.targetReference],
      evidence: input.proximity.evidence,
      whyItMatters: "Placement evidence can highlight layout review areas, but it does not validate assembly, thermal, or electrical correctness.",
      recommendation: input.recommendation,
      limitations: input.proximity.limitations,
      requiredFilesForStrongerValidation: ["parsed Gerber attributes", "parsed Gerber board outline", "mechanical constraints"]
    }),
    placementCategory: input.category
  };
}
