import type { NormalizedNetInventory } from "../../domain/nets";
import type { ExportTable } from "./exportTypes";

export function buildNetExport(inventory: NormalizedNetInventory): ExportTable {
  return {
    filename: "geberai-net-inventory.csv",
    columns: ["name", "classification", "confidence", "sources", "pcbPads", "segments", "vias", "zones", "labels", "limitations"],
    rows: inventory.nets.map((net) => ({
      name: net.name,
      classification: net.classification,
      confidence: net.classificationConfidence,
      sources: net.sources.join("; "),
      pcbPads: net.connectedPcbPads.length,
      segments: net.pcbSegmentCount,
      vias: net.pcbViaCount,
      zones: net.pcbZoneCount,
      labels: net.schematicLabelCount,
      limitations: net.limitations.join(" ")
    }))
  };
}
