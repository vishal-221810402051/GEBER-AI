import type {
  ClassificationConfidence,
  FileCategory
} from "../features/intake/intakeTypes";
import type { ProjectAssumption, ProjectEvidence } from "./evidence";
import type { ProjectMode } from "./workflow";
import type { ParserResult } from "./parser";
import type { MissingDataWarning } from "./warnings";
import type { KiCadPcbParseResult } from "../features/parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../features/parsers/kicad-schematic/kicadSchematicTypes";
import type { BomParseResult } from "../features/parsers/bom/bomTypes";
import type { PlacementParseResult } from "../features/parsers/placement/placementTypes";
import type { GerberParseResult, GerberProjectSummary } from "../features/parsers/gerber";
import type { NormalizedNetInventory } from "./nets";
import type { BoardAnalysis } from "./analysis";
import type { FirmwareManual } from "./firmware";
import type { EngineeringReport } from "./report";

export type ProjectFileCategory = FileCategory;

export type ProjectReadiness =
  | "Insufficient"
  | "Basic manufacturing package only"
  | "Partial engineering package"
  | "Strong analysis package"
  | "Complete analysis package";

export type ProjectSourceFile = Readonly<{
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  extension: string;
  category: ProjectFileCategory;
  categoryLabel: string;
  classificationConfidence: ClassificationConfidence;
  metadataOnly: true;
}>;

export type NormalizedBoardModel = Readonly<{
  status: "future-model" | "parsed-layout";
  message: string;
  kicadPcb?: KiCadPcbParseResult;
}>;

export type NormalizedSchematicModel = Readonly<{
  status: "future-model" | "parsed-schematic";
  message: string;
  kicadSchematic?: KiCadSchematicParseResult;
}>;
export type NormalizedBomModel = Readonly<{
  status: "future-model" | "parsed-table" | "unsupported";
  message: string;
  bom?: BomParseResult;
}>;
export type NormalizedPlacementModel = Readonly<{
  status: "future-model" | "parsed-table";
  message: string;
  placement?: PlacementParseResult;
}>;
export type NormalizedGerberModel = Readonly<{
  status: "future-model" | "parsed-geometry" | "partial-geometry" | "failed";
  message: string;
  files: readonly GerberParseResult[];
  summary: GerberProjectSummary;
}>;
export type NormalizedFirmwareModel = Readonly<{
  status: "future-model" | "firmware-manual";
  message: string;
  manual?: FirmwareManual;
}>;
export type NormalizedReportModel = Readonly<{
  status: "future-model" | "engineering-report";
  message: string;
  engineeringReport?: EngineeringReport;
}>;

export type NormalizedPCBProject = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  selectedMode: ProjectMode;
  sourceFiles: readonly ProjectSourceFile[];
  fileCategories: readonly ProjectFileCategory[];
  completenessScore: number;
  readinessLabel: ProjectReadiness;
  parserResult: ParserResult;
  missingDataWarnings: readonly MissingDataWarning[];
  directEvidence: readonly ProjectEvidence[];
  inferredEvidence: readonly ProjectEvidence[];
  assumptions: readonly ProjectAssumption[];
  board: NormalizedBoardModel;
  schematic: NormalizedSchematicModel;
  bom: NormalizedBomModel;
  placement: NormalizedPlacementModel;
  gerber: NormalizedGerberModel;
  netInventory: NormalizedNetInventory;
  analysis: BoardAnalysis;
  firmware: NormalizedFirmwareModel;
  report: NormalizedReportModel;
}>;
