import type { EngineeringReport } from "../../domain/report";

export function reportMarkdown(report: EngineeringReport): string {
  return report.markdown;
}
