import type { BomParseResult } from "../parsers/bom/bomTypes";
import type { ExportTable } from "./exportTypes";

export function buildBomExport(bom: BomParseResult): ExportTable {
  return {
    filename: "geberai-bom.csv",
    columns: ["refs", "quantity", "value", "footprint", "description", "mpn", "supplierPn", "supplier", "tolerance", "voltage", "current", "notes", "confidence"],
    rows: bom.rows.map((row) => ({
      refs: row.referenceDesignatorsRaw ?? row.referenceDesignators.join(" "),
      quantity: row.quantity ?? "unknown",
      value: row.value ?? "unknown",
      footprint: row.footprint ?? "unknown",
      description: row.description ?? "",
      mpn: row.manufacturerPartNumber ?? "",
      supplierPn: row.supplierPartNumber ?? "",
      supplier: row.supplier ?? "",
      tolerance: row.tolerance ?? "",
      voltage: row.voltageRating ?? "",
      current: row.currentRating ?? "unknown",
      notes: row.notes ?? "",
      confidence: row.confidence
    }))
  };
}
