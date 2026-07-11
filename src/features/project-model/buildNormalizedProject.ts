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
import { buildFirmwareManual } from "../firmware/buildFirmwareManual";
import { buildEngineeringReport } from "../report/buildEngineeringReport";
import type { ProjectModelInput } from "./projectModelTypes";
import { summarizeGerberProject } from "../parsers/gerber";

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

function parsedGerberModel(input: ProjectModelInput) {
  const files = input.files
    .filter((file) => file.category === "gerber" || file.category === "gerber-x2")
    .map((file) => input.gerberParserResults[file.id])
    .filter(Boolean);
  const summary = summarizeGerberProject(files);

  if (files.length === 0) {
    return {
      status: "future-model" as const,
      message: "Gerber geometry parser waits for canonical Gerber files.",
      files,
      summary
    };
  }

  if (summary.failedFiles === files.length) {
    return {
      status: "failed" as const,
      message:
        "Gerber files were detected, but supported RS-274X geometry could not be parsed. No Gerber manufacturing validation is claimed.",
      files,
      summary
    };
  }

  if (summary.warningFiles || summary.failedFiles || summary.filesWithPartialGeometry) {
    return {
      status: "partial-geometry" as const,
      message:
        "Gerber RS-274X geometry parsed with warnings or partial coverage. X2 semantics, drill parsing, and schematic correlation are not implemented.",
      files,
      summary
    };
  }

  return {
    status: "parsed-geometry" as const,
    message:
      "Gerber RS-274X geometry parsed for supported syntax. This is parsed file geometry, not manufacturing validation.",
    files,
    summary
  };
}

function firmwareModel(project: Omit<NormalizedPCBProject, "analysis" | "firmware" | "report"> & Pick<NormalizedPCBProject, "analysis">) {
  const manual = buildFirmwareManual(project as NormalizedPCBProject);
  return {
    status: manual.available ? ("firmware-manual" as const) : ("future-model" as const),
    message: manual.available
      ? "Firmware Mode manual generated from parsed evidence. Guidance only; firmware correctness is not claimed."
      : "Firmware Mode requires schematic and/or PCB evidence for useful pin mapping.",
    manual
  };
}

function reportModel(project: Omit<NormalizedPCBProject, "report">) {
  const engineeringReport = buildEngineeringReport(project as NormalizedPCBProject);
  return {
    status: engineeringReport.available ? ("engineering-report" as const) : ("future-model" as const),
    message: engineeringReport.available
      ? "Phase 11 engineering report generated from parsed evidence and deterministic analysis. No full validation is claimed."
      : "Engineering report requires uploaded project files.",
    engineeringReport
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
  const gerber = parsedGerberModel(input);
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
    gerber,
    netInventory
  };

  const projectWithAnalysis = {
    ...projectWithoutAnalysis,
    analysis: buildBoardAnalysis(projectWithoutAnalysis)
  };

  const firmware = firmwareModel(projectWithAnalysis);
  return {
    ...projectWithAnalysis,
    firmware,
    report: reportModel({ ...projectWithAnalysis, firmware })
  };
}
