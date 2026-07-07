import type { BoardAnalysis } from "../../domain/analysis";
import type { ExportTable } from "./exportTypes";

export function buildPlacementExport(analysis: BoardAnalysis): ExportTable {
  return {
    filename: "geberai-placement-summary.csv",
    columns: ["reference", "role", "source", "x", "y", "side", "rotation", "confidence", "missingFields"],
    rows: analysis.placement.components.map((component) => ({
      reference: component.reference,
      role: component.role,
      source: component.source,
      x: component.x ?? "unknown",
      y: component.y ?? "unknown",
      side: component.side,
      rotation: component.rotation ?? "unknown",
      confidence: component.confidence,
      missingFields: component.missingFields.join("; ")
    }))
  };
}

export function buildPlacementFindingsExport(analysis: BoardAnalysis): ExportTable {
  return {
    filename: "geberai-placement-findings.csv",
    columns: ["id", "category", "severity", "confidence", "component", "title", "recommendation"],
    rows: analysis.placement.findings.map((finding) => ({
      id: finding.id,
      category: finding.placementCategory,
      severity: finding.severity,
      confidence: finding.confidence,
      component: finding.affectedComponent ?? "unknown",
      title: finding.title,
      recommendation: finding.recommendation
    }))
  };
}
