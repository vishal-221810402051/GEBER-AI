import type {
  AnalysisMode,
  ClassificationConfidence,
  FileCategory
} from "../features/intake/intakeTypes";
import type { ProjectAssumption, ProjectEvidence } from "./evidence";
import type { ParserResult } from "./parser";
import type { MissingDataWarning } from "./warnings";
import type { KiCadPcbParseResult } from "../features/parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../features/parsers/kicad-schematic/kicadSchematicTypes";

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
export type NormalizedBomModel = NormalizedBoardModel;
export type NormalizedPlacementModel = NormalizedBoardModel;
export type NormalizedFirmwareModel = NormalizedBoardModel;
export type NormalizedReportModel = NormalizedBoardModel;

export type NormalizedPCBProject = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  selectedMode: AnalysisMode;
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
  firmware: NormalizedFirmwareModel;
  report: NormalizedReportModel;
}>;
