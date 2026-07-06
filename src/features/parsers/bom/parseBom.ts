import { extractBomSummary } from "./extractBomSummary";
import { mapBomColumns } from "./bomColumnMapping";
import { parseReferenceDesignators } from "./referenceDesignators";
import type { BomParseResult, BomRow } from "./bomTypes";
import { parseDelimitedText, type TableParserDiagnostic } from "../shared/delimitedText";

function emptyResult(sourceFileId: string, sourceFileName: string, diagnostics: TableParserDiagnostic[], unsupported = false): BomParseResult {
  return {
    success: false,
    unsupported,
    sourceFileId,
    sourceFileName,
    rows: [],
    summary: extractBomSummary([], unsupported),
    diagnostics
  };
}

export function parseBom(text: string, sourceFileId: string, sourceFileName: string): BomParseResult {
  if (/\.(xlsx|xls)$/i.test(sourceFileName)) {
    return emptyResult(sourceFileId, sourceFileName, [
      {
        severity: "medium",
        message: "Spreadsheet file recognized, but spreadsheet parsing is not implemented in Phase 6.",
        confidence: "direct",
        parserStage: "bom-parser"
      }
    ], true);
  }

  const table = parseDelimitedText(text, "bom-parser");
  const columns = mapBomColumns(table.headers);
  const diagnostics = [...table.diagnostics];

  if (!columns.references) {
    diagnostics.push({
      severity: "high",
      message: "Missing reference column.",
      confidence: "direct",
      parserStage: "bom-parser",
      columnName: "Reference"
    });
  }

  const rows: BomRow[] = table.rows.map((row, index) => {
    const rowDiagnostics: TableParserDiagnostic[] = [];
    const referencesRaw = columns.references ? row[columns.references] : undefined;
    const quantityRaw = columns.quantity ? row[columns.quantity] : undefined;
    const quantity = quantityRaw ? Number(quantityRaw) : undefined;

    if (!referencesRaw) {
      rowDiagnostics.push({
        severity: "medium",
        message: "BOM row is missing reference designators.",
        confidence: "direct",
        parserStage: "bom-parser",
        rowIndex: index + 2
      });
    }

    if (quantityRaw && !Number.isFinite(quantity)) {
      rowDiagnostics.push({
        severity: "medium",
        message: "BOM row has non-numeric quantity.",
        confidence: "direct",
        parserStage: "bom-parser",
        rowIndex: index + 2,
        columnName: columns.quantity
      });
    }

    const knownColumns = new Set(Object.values(columns).filter(Boolean));

    return {
      rowIndex: index + 2,
      referenceDesignatorsRaw: referencesRaw,
      referenceDesignators: parseReferenceDesignators(referencesRaw),
      quantity: Number.isFinite(quantity) ? quantity : undefined,
      value: columns.value ? row[columns.value] : undefined,
      footprint: columns.footprint ? row[columns.footprint] : undefined,
      description: columns.description ? row[columns.description] : undefined,
      manufacturerPartNumber: columns.manufacturerPartNumber ? row[columns.manufacturerPartNumber] : undefined,
      supplierPartNumber: columns.supplierPartNumber ? row[columns.supplierPartNumber] : undefined,
      supplier: columns.supplier ? row[columns.supplier] : undefined,
      tolerance: columns.tolerance ? row[columns.tolerance] : undefined,
      voltageRating: columns.voltageRating ? row[columns.voltageRating] : undefined,
      currentRating: columns.currentRating ? row[columns.currentRating] : undefined,
      notes: columns.notes ? row[columns.notes] : undefined,
      extraFields: Object.fromEntries(
        Object.entries(row).filter(([header]) => !knownColumns.has(header) && row[header])
      ),
      sourceFileName,
      confidence: referencesRaw ? "direct" : "inferred-low",
      diagnostics: rowDiagnostics
    };
  });

  return {
    success: diagnostics.every((item) => item.severity !== "critical"),
    unsupported: false,
    sourceFileId,
    sourceFileName,
    rows,
    summary: extractBomSummary(rows),
    diagnostics: [...diagnostics, ...rows.flatMap((row) => row.diagnostics)]
  };
}
