import type { ClassifiedFile, CompletenessSummary } from "../intake/intakeTypes";
import type { AnalysisMode } from "../intake/intakeTypes";

export type ProjectModelInput = Readonly<{
  files: readonly ClassifiedFile[];
  completeness: CompletenessSummary;
  mode: AnalysisMode;
}>;
