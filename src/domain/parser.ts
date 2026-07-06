import type { ClassificationConfidence } from "../features/intake/intakeTypes";

export type ParserStageId =
  | "file-classification"
  | "kicad-pcb-parser"
  | "kicad-schematic-parser"
  | "gerber-parser"
  | "excellon-drill-parser"
  | "ipc-356-parser"
  | "bom-parser"
  | "pick-and-place-parser"
  | "easyeda-parser"
  | "normalization"
  | "analysis-engine"
  | "firmware-mapper"
  | "report-generator";

export type ParserStatus =
  | "not-started"
  | "waiting-for-files"
  | "metadata-classified"
  | "queued-for-future-parser"
  | "parser-unavailable-current-phase"
  | "parsed"
  | "failed"
  | "skipped"
  | "missing-required-file";

export type ParserStage = Readonly<{
  id: ParserStageId;
  label: string;
  status: ParserStatus;
  fileIds: readonly string[];
  confidence: ClassificationConfidence;
  message: string;
  requiredFuturePhase: string;
  blockingMissingFiles: readonly string[];
}>;

export type ParserResult = Readonly<{
  status: ParserStatus;
  stages: readonly ParserStage[];
}>;
