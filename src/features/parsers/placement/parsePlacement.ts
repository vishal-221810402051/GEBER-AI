import { extractPlacementSummary } from "./extractPlacementSummary";
import { mapPlacementColumns } from "./placementColumnMapping";
import type { PlacementParseResult, PlacementRow, PlacementSide } from "./placementTypes";
import { parseDelimitedText, type TableParserDiagnostic } from "../shared/delimitedText";

function normalizeSide(raw: string | undefined): PlacementSide {
  const value = raw?.trim().toLowerCase();

  if (!value) {
    return "unknown";
  }

  if (["top", "f", "front", "f.cu"].includes(value)) {
    return "top";
  }

  if (["bottom", "b", "back", "b.cu"].includes(value)) {
    return "bottom";
  }

  return "unknown";
}

function toNumber(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePlacement(text: string, sourceFileId: string, sourceFileName: string): PlacementParseResult {
  const table = parseDelimitedText(text, "pick-and-place-parser");
  const columns = mapPlacementColumns(table.headers);
  const diagnostics = [...table.diagnostics];

  if (!columns.reference) {
    diagnostics.push({
      severity: "high",
      message: "Missing reference column.",
      confidence: "direct",
      parserStage: "pick-and-place-parser",
      columnName: "Reference"
    });
  }

  if (!columns.x || !columns.y) {
    diagnostics.push({
      severity: "high",
      message: "Missing X/Y coordinate column.",
      confidence: "direct",
      parserStage: "pick-and-place-parser"
    });
  }

  const rows: PlacementRow[] = table.rows.map((row, index) => {
    const rowDiagnostics: TableParserDiagnostic[] = [];
    const x = toNumber(columns.x ? row[columns.x] : undefined);
    const y = toNumber(columns.y ? row[columns.y] : undefined);
    const rotation = toNumber(columns.rotation ? row[columns.rotation] : undefined);
    const sideRaw = columns.side ? row[columns.side] : undefined;
    const side = normalizeSide(sideRaw);

    if (!columns.reference || !row[columns.reference]) {
      rowDiagnostics.push({
        severity: "medium",
        message: "Placement row is missing reference designator.",
        confidence: "direct",
        parserStage: "pick-and-place-parser",
        rowIndex: index + 2
      });
    }

    if (x === undefined || y === undefined) {
      rowDiagnostics.push({
        severity: "medium",
        message: "Placement row is missing numeric X/Y coordinate.",
        confidence: "direct",
        parserStage: "pick-and-place-parser",
        rowIndex: index + 2
      });
    }

    if (columns.rotation && row[columns.rotation] && rotation === undefined) {
      rowDiagnostics.push({
        severity: "medium",
        message: "Placement row has non-numeric rotation.",
        confidence: "direct",
        parserStage: "pick-and-place-parser",
        rowIndex: index + 2,
        columnName: columns.rotation
      });
    }

    if (sideRaw && side === "unknown") {
      rowDiagnostics.push({
        severity: "low",
        message: "Placement row has unknown side value.",
        confidence: "direct",
        parserStage: "pick-and-place-parser",
        rowIndex: index + 2,
        columnName: columns.side
      });
    }

    return {
      rowIndex: index + 2,
      reference: columns.reference ? row[columns.reference] : undefined,
      x,
      y,
      rotation,
      side,
      footprint: columns.footprint ? row[columns.footprint] : undefined,
      value: columns.value ? row[columns.value] : undefined,
      sourceFileName,
      unitAssumption: "unknown",
      confidence: rowDiagnostics.length ? "inferred-medium" : "direct",
      diagnostics: rowDiagnostics
    };
  });

  return {
    success: diagnostics.every((item) => item.severity !== "critical"),
    sourceFileId,
    sourceFileName,
    rows,
    summary: extractPlacementSummary(rows),
    diagnostics: [...diagnostics, ...rows.flatMap((row) => row.diagnostics)]
  };
}
