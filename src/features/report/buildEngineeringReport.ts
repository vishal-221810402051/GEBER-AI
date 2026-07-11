import type { EngineeringReport, EngineeringReportEvidence, EngineeringReportLimitation } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";
import { buildConfidenceSummary } from "./buildConfidenceSummary";
import { buildExecutiveSummary } from "./buildExecutiveSummary";
import { buildMissingDataSummary } from "./buildMissingDataSummary";
import { buildRecommendations } from "./buildRecommendations";
import { buildReportMarkdown } from "./buildReportMarkdown";
import { buildReportSections } from "./buildReportSections";
import { buildRiskMatrix } from "./buildRiskMatrix";

function evidenceRegister(report: Omit<EngineeringReport, "evidenceRegister" | "limitations" | "markdown">): readonly EngineeringReportEvidence[] {
  const evidence = [
    ...report.findings.flatMap((finding) => finding.evidence),
    ...report.riskMatrix.risks.flatMap((risk) => risk.evidence)
  ];
  return evidence.filter((item, index, all) =>
    all.findIndex((other) => other.source === item.source && other.detail === item.detail) === index
  );
}

function limitations(project: NormalizedPCBProject): readonly EngineeringReportLimitation[] {
  return [
    {
      detail: "Report generated from parsed project files and deterministic analysis results. It does not claim full electrical validation.",
      requiredData: ["manual engineering review"]
    },
    {
      detail: "Schematic-to-Gerber validation is not complete unless explicitly implemented in parser/analysis code.",
      requiredData: [".kicad_sch", "parsed Gerber geometry/attributes", "netlist comparison workflow"]
    },
    {
      detail: "Production readiness, manufacturing package validation, power integrity verification, and firmware readiness are not claimed.",
      requiredData: ["datasheets", "manufacturing DFM review", "lab bring-up", "test results"]
    },
    ...project.missingDataWarnings.map((warning) => ({
      detail: warning.message,
      requiredData: warning.requiredFiles
    }))
  ];
}

export function buildEngineeringReport(project: NormalizedPCBProject): EngineeringReport {
  const sections = buildReportSections(project);
  const riskMatrix = buildRiskMatrix(project);
  const recommendations = buildRecommendations(project);
  const confidenceSummary = buildConfidenceSummary(project);
  const missingDataSummary = buildMissingDataSummary(project);
  const findings = riskMatrix.risks;

  const withoutRegisters = {
    available: project.sourceFiles.length > 0,
    phase: "Phase 11" as const,
    metadata: {
      id: `report-${project.id}`,
      projectName: project.name,
      generatedAt: new Date().toISOString(),
      selectedMode: project.selectedMode,
      sourceFileCount: project.sourceFiles.length,
      completenessScore: project.completenessScore,
      readinessLabel: project.readinessLabel
    },
    executiveSummary: buildExecutiveSummary(project),
    sections,
    findings,
    riskMatrix,
    recommendations,
    confidenceSummary,
    missingDataSummary
  };
  const withRegisters = {
    ...withoutRegisters,
    evidenceRegister: evidenceRegister(withoutRegisters),
    limitations: limitations(project)
  };

  return {
    ...withRegisters,
    markdown: buildReportMarkdown(withRegisters)
  };
}
