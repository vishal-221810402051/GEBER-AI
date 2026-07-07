import type { EngineeringReport } from "../../domain/report";
import type { ExportTable } from "./exportTypes";

export function buildRiskExport(report: EngineeringReport): ExportTable {
  return {
    filename: "geberai-risk-matrix.csv",
    columns: ["id", "severity", "confidence", "category", "title", "affectedComponent", "affectedNet", "status", "recommendation", "sourcePhase"],
    rows: report.riskMatrix.risks.map((risk) => ({
      id: risk.id,
      severity: risk.severity,
      confidence: risk.confidence,
      category: risk.category,
      title: risk.title,
      affectedComponent: risk.affectedComponent ?? "",
      affectedNet: risk.affectedNet ?? "",
      status: risk.status,
      recommendation: risk.recommendation,
      sourcePhase: risk.sourcePhase
    }))
  };
}

export function buildRecommendationExport(report: EngineeringReport): ExportTable {
  return {
    filename: "geberai-recommendations.csv",
    columns: ["id", "priority", "category", "title", "evidenceBasis", "requiredAction", "expectedConfidenceImprovement"],
    rows: report.recommendations
  };
}

export function buildMissingDataExport(report: EngineeringReport): ExportTable {
  return {
    filename: "geberai-missing-data.csv",
    columns: ["item", "severity", "requiredFiles", "affectedSections", "confidenceImpact"],
    rows: report.missingDataSummary.map((item) => ({
      item: item.item,
      severity: item.severity,
      requiredFiles: item.requiredFiles.join("; "),
      affectedSections: item.affectedSections.join("; "),
      confidenceImpact: item.confidenceImpact
    }))
  };
}
