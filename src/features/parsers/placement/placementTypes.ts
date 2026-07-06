import type { ClassificationConfidence } from "../../intake/intakeTypes";
import type { TableParserDiagnostic } from "../shared/delimitedText";

export type PlacementSide = "top" | "bottom" | "unknown";

export type PlacementRow = Readonly<{
  rowIndex: number;
  reference?: string;
  x?: number;
  y?: number;
  rotation?: number;
  side: PlacementSide;
  footprint?: string;
  value?: string;
  sourceFileName: string;
  unitAssumption: "unknown";
  confidence: ClassificationConfidence;
  diagnostics: readonly TableParserDiagnostic[];
}>;

export type PlacementSummary = Readonly<{
  rowCount: number;
  topSideCount: number;
  bottomSideCount: number;
  unknownSideCount: number;
  rowsMissingReference: number;
  rowsMissingXY: number;
  rowsMissingRotation: number;
  rowsWithFootprint: number;
  ambiguousRows: number;
}>;

export type PlacementParseResult = Readonly<{
  success: boolean;
  sourceFileId: string;
  sourceFileName: string;
  rows: readonly PlacementRow[];
  summary: PlacementSummary;
  diagnostics: readonly TableParserDiagnostic[];
}>;
