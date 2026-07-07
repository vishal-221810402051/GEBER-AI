import type { EngineeringReportMissingDataSummary } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";

export function buildMissingDataSummary(project: NormalizedPCBProject): readonly EngineeringReportMissingDataSummary[] {
  return project.missingDataWarnings.map((warning) => ({
    item: warning.title,
    severity: warning.severity === "info" ? "informational" : warning.severity,
    requiredFiles: warning.requiredFiles,
    affectedSections: warning.affectedFuturePhases,
    confidenceImpact: warning.message
  }));
}
