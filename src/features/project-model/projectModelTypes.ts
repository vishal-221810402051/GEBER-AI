import type { ClassifiedFile, CompletenessSummary } from "../intake/intakeTypes";
import type { ProjectMode } from "../../domain/workflow";
import type { KiCadPcbParseResult } from "../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../parsers/kicad-schematic/kicadSchematicTypes";
import type { BomParseResult } from "../parsers/bom/bomTypes";
import type { PlacementParseResult } from "../parsers/placement/placementTypes";

export type ProjectModelInput = Readonly<{
  files: readonly ClassifiedFile[];
  completeness: CompletenessSummary;
  mode: ProjectMode;
  kicadPcbResults: Readonly<Record<string, KiCadPcbParseResult>>;
  kicadSchematicResults: Readonly<Record<string, KiCadSchematicParseResult>>;
  bomResults: Readonly<Record<string, BomParseResult>>;
  placementResults: Readonly<Record<string, PlacementParseResult>>;
}>;
