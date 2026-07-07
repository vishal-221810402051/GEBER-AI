import type { AnalysisConfidence, AnalysisSeverity } from "../../domain/analysis";
import type { EngineeringReportRisk, EngineeringReportRiskMatrix } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";

function normalizeSeverity(severity: string): AnalysisSeverity {
  return severity === "critical" || severity === "high" || severity === "medium" || severity === "low"
    ? severity
    : "informational";
}

function statusFor(severity: AnalysisSeverity, confidence: AnalysisConfidence): EngineeringReportRisk["status"] {
  if (confidence === "missing-data") return "cannot-determine";
  if (severity === "informational") return "informational";
  return "needs-review";
}

export function buildRiskMatrix(project: NormalizedPCBProject): EngineeringReportRiskMatrix {
  const missingRisks: EngineeringReportRisk[] = project.missingDataWarnings.map((warning) => ({
    id: `missing-${warning.id}`,
    section: "Missing Data and Confidence Limitations",
    title: warning.title,
    severity: normalizeSeverity(warning.severity),
    confidence: warning.confidence,
    category: "missing-data",
    evidenceSummary: warning.message,
    evidence: [{ source: "missing-data-warning", detail: warning.message, confidence: warning.confidence }],
    whyItMatters: warning.whyItMatters,
    recommendation: `Provide: ${warning.requiredFiles.join(", ") || "required source files"}.`,
    limitation: "Risk is based on missing evidence and may change when files are provided.",
    sourcePhase: "Phase 3",
    sourceDataType: "missing-data warning",
    status: statusFor(normalizeSeverity(warning.severity), warning.confidence)
  }));

  const netRisks: EngineeringReportRisk[] = project.netInventory.diagnostics.map((diagnostic) => ({
    id: `net-${diagnostic.id}`,
    section: "Netlist and Net Classification Analysis",
    title: diagnostic.message,
    severity: normalizeSeverity(diagnostic.severity),
    confidence: diagnostic.confidence,
    category: "net-classification",
    affectedNet: undefined,
    evidenceSummary: diagnostic.message,
    evidence: [{ source: "net-inventory", detail: diagnostic.message, confidence: diagnostic.confidence }],
    whyItMatters: "Net classification confidence affects downstream analysis and firmware guidance.",
    recommendation: "Review source schematic/PCB net naming and parser coverage.",
    limitation: "Name-based classification is heuristic and not electrical validation.",
    sourcePhase: "Phase 7",
    sourceDataType: "net diagnostic",
    status: statusFor(normalizeSeverity(diagnostic.severity), diagnostic.confidence)
  }));

  const analysisRisks: EngineeringReportRisk[] = [
    ...project.analysis.decoupling.findings.map((finding) => ({ finding, phase: "Phase 8", category: "decoupling" })),
    ...project.analysis.pullResistors.findings.map((finding) => ({ finding, phase: "Phase 8", category: "bias" })),
    ...project.analysis.placement.findings.map((finding) => ({ finding, phase: "Phase 9", category: "placement" })),
    ...project.analysis.powerTree.findings.map((finding) => ({ finding, phase: "Phase 9", category: "power-tree" })),
    ...(project.firmware.manual?.findings ?? []).map((finding) => ({ finding, phase: "Phase 10", category: "firmware" }))
  ].map(({ finding, phase, category }) => ({
    id: finding.id,
    section: category,
    title: finding.title,
    severity: finding.severity,
    confidence: finding.confidence,
    category,
    affectedComponent: finding.affectedComponent,
    affectedNet: finding.affectedNet,
    evidenceSummary: finding.evidence.map((item) => item.detail).join(" ") || "No detailed evidence text available.",
    evidence: finding.evidence.map((item) => ({ source: item.source, detail: item.detail, confidence: item.confidence })),
    whyItMatters: finding.whyItMatters,
    recommendation: finding.recommendation,
    limitation: finding.limitations.join(" "),
    sourcePhase: phase,
    sourceDataType: "analysis finding",
    status: statusFor(finding.severity, finding.confidence)
  }));

  const risks = [...missingRisks, ...netRisks, ...analysisRisks];
  const severityOrder: AnalysisSeverity[] = ["critical", "high", "medium", "low", "informational"];
  const highestSeverity = severityOrder.find((severity) => risks.some((risk) => risk.severity === severity)) ?? "informational";

  return {
    risks,
    highestSeverity,
    bySeverity: risks.reduce((counts, risk) => ({ ...counts, [risk.severity]: (counts[risk.severity] ?? 0) + 1 }), {} as Record<string, number>)
  };
}
