import type {
  NormalizedPCBProject,
  ProjectFileCategory,
  ProjectReadiness,
  ProjectSourceFile
} from "../../domain";
import { buildMissingDataWarnings } from "./buildMissingDataWarnings";
import { buildParserStatus } from "./buildParserStatus";
import { buildProjectEvidence } from "./buildProjectEvidence";
import { buildNetInventory } from "../net-explorer/buildNetInventory";
import { buildBoardAnalysis } from "../analysis/buildBoardAnalysis";
import type { ProjectModelInput } from "./projectModelTypes";

function createProjectId(input: ProjectModelInput): string {
  if (input.files.length === 0) {
    return "project-empty";
  }

  return `project-${input.files.map((file) => file.id).join("|").length}-${input.files.length}`;
}

function createProjectName(input: ProjectModelInput): string {
  const pcbFile = input.files.find((file) => file.category === "kicad-pcb");
  const firstFile = pcbFile ?? input.files[0];

  if (!firstFile) {
    return "Untitled metadata project";
  }

  return firstFile.name.replace(/\.[^.]+$/, "") || "Untitled metadata project";
}

function futureModel(message: string) {
  return {
    status: "future-model" as const,
    message
  };
}

function parsedBoardModel(input: ProjectModelInput) {
  const parsed = Object.values(input.kicadPcbResults).find((result) => result.success);

  if (!parsed) {
    return futureModel("Future board model. No dimensions, layers, pads, tracks, vias, or zones extracted.");
  }

  return {
    status: "parsed-layout" as const,
    message:
      "Layout parsed from .kicad_pcb. Schematic validation begins in Phase 5; no electrical analysis has been performed.",
    kicadPcb: parsed
  };
}

function parsedSchematicModel(input: ProjectModelInput) {
  const parsed = Object.values(input.kicadSchematicResults).find(
    (result) => result.success
  );

  if (!parsed) {
    return {
      status: "future-model" as const,
      message: "Future schematic model. No symbols, labels, wires, or schematic intent extracted."
    };
  }

  return {
    status: "parsed-schematic" as const,
    message:
      "Schematic parsed from .kicad_sch. PCB comparison is not implemented yet; no electrical analysis or firmware mapping has been performed.",
    kicadSchematic: parsed
  };
}

function parsedBomModel(input: ProjectModelInput) {
  const result = Object.values(input.bomResults)[0];

  if (!result) {
    return {
      status: "future-model" as const,
      message: "Future BOM model. No BOM rows parsed or generated."
    };
  }

  return {
    status: result.unsupported ? ("unsupported" as const) : ("parsed-table" as const),
    message: result.unsupported
      ? "BOM spreadsheet recognized, but spreadsheet parsing is not implemented in Phase 6."
      : "BOM parsed as table-level data only. BOM-to-PCB validation is not implemented.",
    bom: result
  };
}

function parsedPlacementModel(input: ProjectModelInput) {
  const result = Object.values(input.placementResults)[0];

  if (!result) {
    return {
      status: "future-model" as const,
      message: "Future placement model. No component coordinates parsed."
    };
  }

  return {
    status: "parsed-table" as const,
    message:
      "Placement parsed as table-level centroid data only. Placement-to-PCB coordinate validation is not implemented.",
    placement: result
  };
}

export function buildNormalizedProject(input: ProjectModelInput): NormalizedPCBProject {
  const now = new Date().toISOString();
  const sourceFiles: readonly ProjectSourceFile[] = input.files.map((file) => ({
    id: file.id,
    name: file.name,
    sizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
    extension: file.extension,
    category: file.category,
    categoryLabel: file.categoryLabel,
    classificationConfidence: file.confidence,
    metadataOnly: true
  }));
  const evidence = buildProjectEvidence(input);
  const board = parsedBoardModel(input);
  const schematic = parsedSchematicModel(input);
  const bom = parsedBomModel(input);
  const placement = parsedPlacementModel(input);
  const netInventory = buildNetInventory({
    pcb: "kicadPcb" in board ? board.kicadPcb : undefined,
    schematic: "kicadSchematic" in schematic ? schematic.kicadSchematic : undefined
  });

  const projectWithoutAnalysis = {
    id: createProjectId(input),
    name: createProjectName(input),
    createdAt: now,
    updatedAt: now,
    selectedMode: input.mode,
    sourceFiles,
    fileCategories: Array.from(
      new Set(input.files.map((file) => file.category))
    ) as readonly ProjectFileCategory[],
    completenessScore: input.completeness.score,
    readinessLabel: input.completeness.readinessLabel as ProjectReadiness,
    parserResult: buildParserStatus(input),
    missingDataWarnings: buildMissingDataWarnings(input),
    directEvidence: evidence.directEvidence,
    inferredEvidence: evidence.inferredEvidence,
    assumptions: evidence.assumptions,
    board,
    schematic,
    bom,
    placement,
    netInventory,
    firmware: futureModel("Future firmware model. No MCU pins or peripherals mapped."),
    report: futureModel("Future report model. No report generated or exported.")
  };

  return {
    ...projectWithoutAnalysis,
    analysis: buildBoardAnalysis(projectWithoutAnalysis)
  };
}
