import type {
  NormalizedPCBProject,
  ProjectFileCategory,
  ProjectReadiness,
  ProjectSourceFile
} from "../../domain";
import { buildMissingDataWarnings } from "./buildMissingDataWarnings";
import { buildParserStatus } from "./buildParserStatus";
import { buildProjectEvidence } from "./buildProjectEvidence";
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

  return {
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
    board: futureModel("Future board model. No dimensions, layers, pads, tracks, vias, or zones extracted."),
    schematic: futureModel("Future schematic model. No symbols, nets, or schematic intent extracted."),
    bom: futureModel("Future BOM model. No BOM rows parsed or generated."),
    placement: futureModel("Future placement model. No component coordinates parsed."),
    firmware: futureModel("Future firmware model. No MCU pins or peripherals mapped."),
    report: futureModel("Future report model. No report generated or exported.")
  };
}
