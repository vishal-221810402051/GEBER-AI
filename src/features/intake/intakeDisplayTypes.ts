import type { ClassifiedFile, FileCategory } from "./intakeTypes";
import type { KiCadPcbParseResult } from "../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../parsers/kicad-schematic/kicadSchematicTypes";
import type { BomParseResult } from "../parsers/bom/bomTypes";
import type { PlacementParseResult } from "../parsers/placement/placementTypes";
import type { GerberParseResult } from "../parsers/gerber";

export type IntakeParserResult =
  | KiCadPcbParseResult
  | KiCadSchematicParseResult
  | BomParseResult
  | PlacementParseResult
  | GerberParseResult;

export type IntakeFileStatus =
  | "recognized"
  | "parsed"
  | "failed"
  | "unsupported"
  | "warning"
  | "metadata-only"
  | "not-parsed";

export type IntakeDisplayFile = Readonly<{
  file: ClassifiedFile;
  status: IntakeFileStatus;
  statusLabel: string;
  parserResult?: IntakeParserResult;
  summaryItems: readonly string[];
  diagnostics: readonly { severity?: string; message: string; confidence?: string }[];
}>;

export type IntakeDisplayGroup = Readonly<{
  id: string;
  title: string;
  categories: readonly FileCategory[];
  files: readonly IntakeDisplayFile[];
  parsedCount: number;
  warningCount: number;
  failedCount: number;
}>;

export type IntakeParserResultMaps = Readonly<{
  kicadPcbResults: Readonly<Record<string, KiCadPcbParseResult>>;
  kicadSchematicResults: Readonly<Record<string, KiCadSchematicParseResult>>;
  bomResults: Readonly<Record<string, BomParseResult>>;
  placementResults: Readonly<Record<string, PlacementParseResult>>;
  gerberParserResults: Readonly<Record<string, GerberParseResult>>;
}>;
