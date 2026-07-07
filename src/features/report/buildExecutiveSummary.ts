import type { NormalizedPCBProject } from "../../domain/project";

export function buildExecutiveSummary(project: NormalizedPCBProject): readonly string[] {
  const parsedFiles = [
    project.board.kicadPcb ? ".kicad_pcb layout" : undefined,
    project.schematic.kicadSchematic ? ".kicad_sch schematic" : undefined,
    project.bom.bom && !project.bom.bom.unsupported ? "BOM table" : undefined,
    project.placement.placement ? "pick-and-place table" : undefined
  ].filter(Boolean);
  const missing = project.missingDataWarnings.slice(0, 4).map((warning) => warning.title);
  const highRisks = [
    ...project.analysis.decoupling.findings,
    ...project.analysis.pullResistors.findings,
    ...project.analysis.placement.findings,
    ...project.analysis.powerTree.findings,
    ...(project.firmware.manual?.findings ?? [])
  ].filter((finding) => finding.severity === "critical" || finding.severity === "high" || finding.severity === "medium");

  return [
    `Project ${project.name} is reported in ${project.selectedMode} mode with completeness score ${project.completenessScore}/100 (${project.readinessLabel}).`,
    `The report is generated from parsed project files and deterministic analysis results. Parsed data currently includes: ${parsedFiles.join(", ") || "uploaded file metadata only"}.`,
    `Major missing data includes: ${missing.join(", ") || "no high-priority missing-data warning currently listed"}.`,
    `Highest-impact findings available for review: ${highRisks.slice(0, 5).map((finding) => finding.title).join("; ") || "none at high/medium severity from current evidence"}.`,
    "Findings are limited by available files and parser coverage. Electrical correctness and production readiness are not guaranteed."
  ];
}
