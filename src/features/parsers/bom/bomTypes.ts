import type { ClassificationConfidence } from "../../intake/intakeTypes";
import type { TableParserDiagnostic } from "../shared/delimitedText";

export type BomRow = Readonly<{
  rowIndex: number;
  referenceDesignatorsRaw?: string;
  referenceDesignators: readonly string[];
  quantity?: number;
  value?: string;
  footprint?: string;
  description?: string;
  manufacturerPartNumber?: string;
  supplierPartNumber?: string;
  supplier?: string;
  tolerance?: string;
  voltageRating?: string;
  currentRating?: string;
  notes?: string;
  extraFields: Readonly<Record<string, string>>;
  sourceFileName: string;
  confidence: ClassificationConfidence;
  diagnostics: readonly TableParserDiagnostic[];
}>;

export type BomSummary = Readonly<{
  rowCount: number;
  totalDeclaredQuantity: number;
  parsedReferenceCount: number;
  rowsWithMissingReference: number;
  rowsWithMissingValue: number;
  rowsWithMissingFootprint: number;
  rowsWithManufacturerPartNumbers: number;
  rowsWithSupplierPartNumbers: number;
  ambiguousRows: number;
  unsupportedSpreadsheet: boolean;
}>;

export type BomParseResult = Readonly<{
  success: boolean;
  unsupported: boolean;
  sourceFileId: string;
  sourceFileName: string;
  rows: readonly BomRow[];
  summary: BomSummary;
  diagnostics: readonly TableParserDiagnostic[];
}>;
