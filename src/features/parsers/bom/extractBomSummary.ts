import type { BomRow, BomSummary } from "./bomTypes";

export function extractBomSummary(rows: readonly BomRow[], unsupportedSpreadsheet = false): BomSummary {
  return {
    rowCount: rows.length,
    totalDeclaredQuantity: rows.reduce((total, row) => total + (row.quantity ?? 0), 0),
    parsedReferenceCount: rows.reduce(
      (total, row) => total + row.referenceDesignators.length,
      0
    ),
    rowsWithMissingReference: rows.filter((row) => !row.referenceDesignatorsRaw).length,
    rowsWithMissingValue: rows.filter((row) => !row.value).length,
    rowsWithMissingFootprint: rows.filter((row) => !row.footprint).length,
    rowsWithManufacturerPartNumbers: rows.filter((row) => row.manufacturerPartNumber).length,
    rowsWithSupplierPartNumbers: rows.filter((row) => row.supplierPartNumber).length,
    ambiguousRows: rows.filter((row) => row.diagnostics.length > 0).length,
    unsupportedSpreadsheet
  };
}
