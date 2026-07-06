import type { PlacementRow, PlacementSummary } from "./placementTypes";

export function extractPlacementSummary(rows: readonly PlacementRow[]): PlacementSummary {
  return {
    rowCount: rows.length,
    topSideCount: rows.filter((row) => row.side === "top").length,
    bottomSideCount: rows.filter((row) => row.side === "bottom").length,
    unknownSideCount: rows.filter((row) => row.side === "unknown").length,
    rowsMissingReference: rows.filter((row) => !row.reference).length,
    rowsMissingXY: rows.filter((row) => row.x === undefined || row.y === undefined).length,
    rowsMissingRotation: rows.filter((row) => row.rotation === undefined).length,
    rowsWithFootprint: rows.filter((row) => row.footprint).length,
    ambiguousRows: rows.filter((row) => row.diagnostics.length > 0).length
  };
}
