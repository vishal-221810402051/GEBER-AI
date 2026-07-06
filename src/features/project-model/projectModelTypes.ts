import type { ClassifiedFile, CompletenessSummary } from "../intake/intakeTypes";
import type { AnalysisMode } from "../intake/intakeTypes";
import type { KiCadPcbParseResult } from "../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../parsers/kicad-schematic/kicadSchematicTypes";

export type ProjectModelInput = Readonly<{
  files: readonly ClassifiedFile[];
  completeness: CompletenessSummary;
  mode: AnalysisMode;
  kicadPcbResults: Readonly<Record<string, KiCadPcbParseResult>>;
  kicadSchematicResults: Readonly<Record<string, KiCadSchematicParseResult>>;
}>;
