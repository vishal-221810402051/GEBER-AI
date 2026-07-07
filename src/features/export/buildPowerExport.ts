import type { BoardAnalysis } from "../../domain/analysis";
import type { ExportTable } from "./exportTypes";

export function buildPowerRailsExport(analysis: BoardAnalysis): ExportTable {
  return {
    filename: "geberai-power-rails.csv",
    columns: ["rail", "type", "sources", "loads", "pads", "segments", "vias", "zone", "confidence", "limitations"],
    rows: analysis.powerTree.rails.map((rail) => ({
      rail: rail.name,
      type: rail.railType,
      sources: rail.sourceCandidates.join("; ") || "unknown",
      loads: rail.loadCandidates.length,
      pads: rail.connectedPads,
      segments: rail.segmentCount,
      vias: rail.viaCount,
      zone: rail.zonePresent ? "yes" : "no",
      confidence: rail.confidence,
      limitations: rail.limitations.join(" ")
    }))
  };
}

export function buildPowerBudgetExport(analysis: BoardAnalysis): ExportTable {
  return {
    filename: "geberai-power-budget.csv",
    columns: ["rail", "knownLoadCount", "unknownLoadCount", "explicitCurrentValues", "estimatedCurrent", "confidence", "limitations"],
    rows: analysis.powerTree.budgets.map((budget) => ({
      rail: budget.railName,
      knownLoadCount: budget.knownLoadCount,
      unknownLoadCount: budget.unknownLoadCount,
      explicitCurrentValues: budget.explicitCurrentValues.join("; ") || "unknown",
      estimatedCurrent: budget.estimatedCurrent,
      confidence: budget.confidence,
      limitations: budget.limitations.join(" ")
    }))
  };
}
