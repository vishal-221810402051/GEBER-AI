import type { MissingDataSeverity } from "../../../domain";
import type { ClassificationConfidence } from "../../intake/intakeTypes";

export type KiCadSchematicParserDiagnostic = Readonly<{
  severity: MissingDataSeverity;
  message: string;
  confidence: ClassificationConfidence;
  parserStage: "kicad-schematic-parser";
  location?: string;
}>;

export type KiCadSchematicTitleBlock = Readonly<{
  title?: string;
  date?: string;
  revision?: string;
  company?: string;
  comments: readonly string[];
}>;

export type KiCadSchematicMetadata = Readonly<{
  version?: string;
  generator?: string;
  generatorVersion?: string;
  uuid?: string;
  paper?: string;
  titleBlock?: KiCadSchematicTitleBlock;
}>;

export type KiCadLibraryPin = Readonly<{
  number?: string;
  name?: string;
  type?: string;
  electricalType?: string;
  unit?: string;
}>;

export type KiCadLibrarySymbol = Readonly<{
  id: string;
  name: string;
  pins: readonly KiCadLibraryPin[];
}>;

export type KiCadSchematicProperty = Readonly<{
  name: string;
  value: string;
}>;

export type KiCadSchematicSymbol = Readonly<{
  reference?: string;
  value?: string;
  libId?: string;
  footprint?: string;
  datasheet?: string;
  description?: string;
  properties: readonly KiCadSchematicProperty[];
  x?: number;
  y?: number;
  rotation?: number;
  unit?: string;
  inBom?: boolean;
  onBoard?: boolean;
  uuid?: string;
  sourceFileId: string;
  pins: readonly KiCadLibraryPin[];
}>;

export type KiCadSchematicLabel = Readonly<{
  kind: "label" | "global_label" | "hierarchical_label" | "text";
  name: string;
  x?: number;
  y?: number;
  rotation?: number;
  shape?: string;
}>;

export type KiCadSchematicWire = Readonly<{
  points: readonly { x: number; y: number }[];
}>;

export type KiCadSchematicJunction = Readonly<{
  x?: number;
  y?: number;
  uuid?: string;
}>;

export type KiCadSchematicNoConnect = KiCadSchematicJunction;

export type KiCadSchematicSheetPin = Readonly<{
  name?: string;
  type?: string;
  x?: number;
  y?: number;
}>;

export type KiCadSchematicSheet = Readonly<{
  name?: string;
  file?: string;
  uuid?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pins: readonly KiCadSchematicSheetPin[];
}>;

export type KiCadSchematicSummary = Readonly<{
  symbolInstanceCount: number;
  librarySymbolCount: number;
  propertyCount: number;
  labelCount: number;
  globalLabelCount: number;
  hierarchicalLabelCount: number;
  wireCount: number;
  junctionCount: number;
  noConnectCount: number;
  sheetCount: number;
  symbolsInBom: number;
  symbolsOnBoard: number;
  symbolsWithFootprint: number;
  symbolsMissingFootprint: number;
}>;

export type KiCadSchematicParseResult = Readonly<{
  success: boolean;
  sourceFileId: string;
  sourceFileName: string;
  metadata: KiCadSchematicMetadata;
  librarySymbols: readonly KiCadLibrarySymbol[];
  symbols: readonly KiCadSchematicSymbol[];
  labels: readonly KiCadSchematicLabel[];
  wires: readonly KiCadSchematicWire[];
  junctions: readonly KiCadSchematicJunction[];
  noConnects: readonly KiCadSchematicNoConnect[];
  sheets: readonly KiCadSchematicSheet[];
  summary: KiCadSchematicSummary;
  diagnostics: readonly KiCadSchematicParserDiagnostic[];
}>;
