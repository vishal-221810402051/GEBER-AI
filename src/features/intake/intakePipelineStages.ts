import type {
  NormalizedPCBProject,
  ParserStage,
  ParserStatus
} from "../../domain";
import type { PipelineStage } from "../../components/ui";
import type { IntakeParserResultMaps, IntakeParserResult } from "./intakeDisplayTypes";
import type { ProjectMode } from "../../domain/workflow";
import type { ClassifiedFile, FileCategory } from "./intakeTypes";

export type IntakePipelineStageId =
  | "files"
  | "classification"
  | "schematic-parser"
  | "gerber-parser"
  | "normalization"
  | "analysis"
  | "firmware"
  | "report";

export type IntakePipelineStageStatus =
  | "idle"
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "error"
  | "not-applicable";

export type IntakePipelineStage = {
  id: IntakePipelineStageId;
  label: string;
  description?: string;
  status: IntakePipelineStageStatus;
  detail?: string;
  count?: number;
};

export type IntakeProcessingState = Readonly<{
  active: boolean;
  title: string;
  message?: string;
  progress?: number;
  currentStage?: string;
}>;

export type IntakePipelineInput = Readonly<{
  files: readonly ClassifiedFile[];
  mode: ProjectMode;
  normalizedProject: NormalizedPCBProject;
  parserResults: IntakeParserResultMaps;
  processingState?: IntakeProcessingState;
}>;

const parserCategories = new Set<FileCategory>([
  "kicad-pcb",
  "kicad-schematic",
  "gerber",
  "gerber-x2",
  "bom",
  "pick-and-place"
]);

function filesByCategory(files: readonly ClassifiedFile[], categories: readonly FileCategory[]) {
  return files.filter((file) => categories.includes(file.category));
}

function stageById(stages: readonly ParserStage[], id: ParserStage["id"]) {
  return stages.find((stage) => stage.id === id);
}

function parserStatusToStageStatus(status: ParserStatus): IntakePipelineStageStatus {
  if (status === "parsed" || status === "metadata-classified") {
    return "complete";
  }

  if (status === "parsed-with-warnings" || status === "partial-geometry") {
    return "warning";
  }

  if (status === "failed") {
    return "error";
  }

  if (status === "missing-required-file" || status === "skipped") {
    return "not-applicable";
  }

  if (status === "queued-for-future-parser" || status === "parser-unavailable-current-phase") {
    return "warning";
  }

  return "pending";
}

function resultForFile(file: ClassifiedFile, results: IntakeParserResultMaps): IntakeParserResult | undefined {
  if (file.category === "kicad-pcb") {
    return results.kicadPcbResults[file.id];
  }

  if (file.category === "kicad-schematic") {
    return results.kicadSchematicResults[file.id];
  }

  if (file.category === "bom") {
    return results.bomResults[file.id];
  }

  if (file.category === "pick-and-place") {
    return results.placementResults[file.id];
  }

  if (file.category === "gerber" || file.category === "gerber-x2") {
    return results.gerberParserResults[file.id];
  }

  return undefined;
}

function resultHasWarning(result: IntakeParserResult) {
  return result.diagnostics.length > 0 || ("geometryCoverage" in result && result.geometryCoverage === "partial");
}

function resultHasError(result: IntakeParserResult) {
  if ("status" in result) {
    return result.status === "failed";
  }

  return !result.success || ("unsupported" in result && result.unsupported);
}

function parserStageForFiles(
  id: IntakePipelineStageId,
  label: string,
  files: readonly ClassifiedFile[],
  results: IntakeParserResultMaps,
  fallbackStage?: ParserStage
): IntakePipelineStage {
  if (files.length === 0) {
    return {
      id,
      label,
      status: "not-applicable",
      description: fallbackStage?.message ?? "No matching input file is loaded.",
      detail: "No input file",
      count: 0
    };
  }

  const fileResults = files.map((file) => resultForFile(file, results));
  const resolvedResults = fileResults.filter(Boolean) as IntakeParserResult[];

  if (resolvedResults.length < files.length) {
    return {
      id,
      label,
      status: "active",
      description: "Waiting for browser file reads and local parser results.",
      detail: `${resolvedResults.length}/${files.length} parsed`,
      count: files.length
    };
  }

  if (resolvedResults.some(resultHasError)) {
    return {
      id,
      label,
      status: "error",
      description: fallbackStage?.message,
      detail: `${resolvedResults.filter(resultHasError).length} failed`,
      count: files.length
    };
  }

  if (resolvedResults.some(resultHasWarning)) {
    return {
      id,
      label,
      status: "warning",
      description: fallbackStage?.message,
      detail: `${resolvedResults.reduce((count, result) => count + result.diagnostics.length, 0)} diagnostic(s)`,
      count: files.length
    };
  }

  return {
    id,
    label,
    status: "complete",
    description: fallbackStage?.message,
    detail: `${files.length} parsed`,
    count: files.length
  };
}

export function deriveIntakeProcessingState(
  files: readonly ClassifiedFile[],
  results: IntakeParserResultMaps
): IntakeProcessingState {
  const parseableFiles = files.filter((file) => parserCategories.has(file.category));
  const resolvedCount = parseableFiles.filter((file) => resultForFile(file, results)).length;
  const pendingCount = parseableFiles.length - resolvedCount;

  if (parseableFiles.length === 0 || pendingCount === 0) {
    return {
      active: false,
      title: "Local processing idle"
    };
  }

  return {
    active: true,
    title: "Processing project files",
    message: `${pendingCount} parser input(s) are being read and processed locally in this browser.`,
    progress: Math.round((resolvedCount / parseableFiles.length) * 100),
    currentStage: "Local parser pipeline"
  };
}

export function buildIntakePipelineStages(input: IntakePipelineInput): readonly IntakePipelineStage[] {
  const { files, mode, normalizedProject, parserResults, processingState } = input;
  const parserStages = normalizedProject.parserResult.stages;
  const hasFiles = files.length > 0;
  const unknownFiles = files.filter((file) => file.category === "unknown");
  const classificationStage = stageById(parserStages, "file-classification");
  const missingWarnings = normalizedProject.missingDataWarnings.length;
  const analysisAvailable =
    normalizedProject.netInventory.available ||
    normalizedProject.analysis.decoupling.available ||
    normalizedProject.analysis.pullResistors.available ||
    normalizedProject.analysis.placement.available ||
    normalizedProject.analysis.powerTree.available ||
    normalizedProject.analysis.componentRoles.length > 0;
  const firmwareManual = normalizedProject.firmware.manual;
  const report = normalizedProject.report.engineeringReport;

  return [
    {
      id: "files",
      label: "Files",
      status: hasFiles ? "complete" : "idle",
      description: hasFiles
        ? `${files.length} file(s) selected for local review.`
        : "Waiting for project files.",
      detail: hasFiles ? `${files.length} selected` : "No files",
      count: files.length
    },
    {
      id: "classification",
      label: "Classification",
      status: !hasFiles
        ? "pending"
        : unknownFiles.length
          ? "warning"
          : parserStatusToStageStatus(classificationStage?.status ?? "not-started"),
      description: unknownFiles.length
        ? "Some files could not be classified from filename or extension metadata."
        : classificationStage?.message,
      detail: unknownFiles.length
        ? `${unknownFiles.length} unsupported/unknown`
        : filesByCategory(files, ["gerber", "gerber-x2", "archive"]).length
          ? "Gerber/package detected"
          : undefined,
      count: files.length
    },
    parserStageForFiles(
      "schematic-parser",
      "Schematic parser",
      filesByCategory(files, ["kicad-schematic"]),
      parserResults,
      stageById(parserStages, "kicad-schematic-parser")
    ),
    parserStageForFiles(
      "gerber-parser",
      "Gerber geometry parser",
      filesByCategory(files, ["gerber", "gerber-x2"]),
      parserResults,
      stageById(parserStages, "gerber-parser")
    ),
    {
      id: "normalization",
      label: "Normalization",
      status: !hasFiles
        ? "pending"
        : processingState?.active
          ? "active"
          : missingWarnings
            ? "warning"
            : "complete",
      description: hasFiles
        ? "Normalized project state is derived from current local evidence."
        : "Normalized model waits for files.",
      detail: missingWarnings ? `${missingWarnings} missing-data warning(s)` : undefined,
      count: normalizedProject.sourceFiles.length
    },
    {
      id: "analysis",
      label: "Analysis",
      status: !hasFiles
        ? "pending"
        : processingState?.active
          ? "pending"
          : analysisAvailable && missingWarnings === 0
            ? "complete"
            : "warning",
      description: analysisAvailable
        ? "Deterministic review outputs are derived from parsed evidence."
        : "Analysis waits for parser-backed evidence.",
      detail: analysisAvailable ? "Local heuristics only" : "Limited evidence"
    },
    {
      id: "firmware",
      label: "Firmware document",
      status: mode !== "firmware"
        ? "not-applicable"
        : firmwareManual?.available
          ? firmwareManual.summary.readiness === "strong"
            ? "complete"
            : "warning"
          : "warning",
      description: firmwareManual?.available
        ? "Firmware document is selected from deterministic schematic-first evidence."
        : "Firmware document requires canonical schematic and Gerber/package evidence.",
      detail: firmwareManual?.available ? firmwareManual.summary.readiness : undefined
    },
    {
      id: "report",
      label: "Inspection report",
      status: mode !== "inspect"
        ? "not-applicable"
        : report?.available
          ? report.missingDataSummary.length || report.limitations.length
            ? "warning"
            : "complete"
          : hasFiles
            ? "warning"
            : "pending",
      description: report?.available
        ? "Inspection report is selected from deterministic local state."
        : "Inspection report waits for canonical project evidence.",
      detail: report?.available ? `${report.missingDataSummary.length} missing-data item(s)` : undefined
    }
  ];
}

export function toPipelineStages(stages: readonly IntakePipelineStage[]): PipelineStage[] {
  return stages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    status: stage.status,
    description: [stage.description, stage.detail].filter(Boolean).join(" ")
  }));
}
