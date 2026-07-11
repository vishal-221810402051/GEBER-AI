import { describe, expect, it } from "vitest";
import type { ProjectMode } from "../domain/workflow";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import type { IntakeParserResultMaps } from "../features/intake/intakeDisplayTypes";
import {
  buildIntakePipelineStages,
  deriveIntakeProcessingState
} from "../features/intake/intakePipelineStages";
import type { ClassifiedFile } from "../features/intake/intakeTypes";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

const emptyResults: IntakeParserResultMaps = {
  bomResults: {},
  kicadPcbResults: {},
  kicadSchematicResults: {},
  placementResults: {}
};

function file(name: string, content = "test"): File {
  return new File([content], name, { type: "text/plain", lastModified: 1 });
}

function classified(name: string, content = "test"): ClassifiedFile {
  return classifyFile(file(name, content));
}

function input(
  files: readonly ClassifiedFile[],
  parserResults: IntakeParserResultMaps = emptyResults,
  mode: ProjectMode = "inspect"
) {
  const completeness = calculateCompleteness(files);
  const normalizedProject = buildNormalizedProject({
    files,
    completeness,
    mode,
    ...parserResults
  });

  return {
    files,
    mode,
    normalizedProject,
    parserResults,
    processingState: deriveIntakeProcessingState(files, parserResults)
  };
}

function stageStatus(stages: ReturnType<typeof buildIntakePipelineStages>, id: string) {
  return stages.find((stage) => stage.id === id)?.status;
}

function stageLabel(stages: ReturnType<typeof buildIntakePipelineStages>, id: string) {
  return stages.find((stage) => stage.id === id)?.label;
}

describe("intake pipeline stages", () => {
  it("keeps the pipeline idle or pending when no files are selected", () => {
    const stages = buildIntakePipelineStages(input([]));

    expect(stageStatus(stages, "files")).toBe("idle");
    expect(stageStatus(stages, "classification")).toBe("pending");
    expect(stageStatus(stages, "schematic-parser")).toBe("not-applicable");
    expect(stageStatus(stages, "report")).toBe("pending");
  });

  it("shows real active processing when schematic parser inputs lack results", () => {
    const schematicFile = classified("board.kicad_sch", minimalSchematic);
    const processingState = deriveIntakeProcessingState([schematicFile], emptyResults);
    const stages = buildIntakePipelineStages(input([schematicFile]));

    expect(processingState.active).toBe(true);
    expect(processingState.progress).toBe(0);
    expect(stageStatus(stages, "schematic-parser")).toBe("active");
  });

  it("marks multiple schematic files complete only when all have parser results", () => {
    const root = classified("root.kicad_sch", minimalSchematic);
    const child = classified("child.kicad_sch", minimalSchematic);
    const stages = buildIntakePipelineStages(
      input([root, child], {
        ...emptyResults,
        kicadSchematicResults: {
          [root.id]: {
            ...parseKicadSchematic(minimalSchematic, root.id, root.name),
            diagnostics: []
          },
          [child.id]: {
            ...parseKicadSchematic(minimalSchematic, child.id, child.name),
            diagnostics: []
          }
        }
      })
    );

    expect(stageStatus(stages, "schematic-parser")).toBe("complete");
  });

  it("maps schematic parser diagnostics to warning and parser failure to error", () => {
    const schematicFile = classified("board.kicad_sch", minimalSchematic);
    const parsed = parseKicadSchematic(minimalSchematic, schematicFile.id, schematicFile.name);
    const warningStages = buildIntakePipelineStages(
      input([schematicFile], {
        ...emptyResults,
        kicadSchematicResults: {
          [schematicFile.id]: {
            ...parsed,
            diagnostics: [
              {
                severity: "high",
                message: "Synthetic test diagnostic",
                confidence: "direct",
                parserStage: "kicad-schematic-parser"
              }
            ]
          }
        }
      })
    );
    const errorStages = buildIntakePipelineStages(
      input([schematicFile], {
        ...emptyResults,
        kicadSchematicResults: {
          [schematicFile.id]: {
            ...parsed,
            success: false
          }
        }
      })
    );

    expect(stageStatus(warningStages, "schematic-parser")).toBe("warning");
    expect(stageStatus(errorStages, "schematic-parser")).toBe("error");
  });

  it("uses mode-specific final stage labels", () => {
    const inspectStages = buildIntakePipelineStages(input([]));
    const firmwareStages = buildIntakePipelineStages(input([], emptyResults, "firmware"));

    expect(stageLabel(inspectStages, "report")).toBe("Inspection report");
    expect(stageStatus(inspectStages, "firmware")).toBe("not-applicable");
    expect(stageLabel(firmwareStages, "firmware")).toBe("Firmware document");
    expect(stageStatus(firmwareStages, "report")).toBe("not-applicable");
  });

  it("marks inspection report available with missing-data limitations as warning", () => {
    const schematicFile = classified("board.kicad_sch", minimalSchematic);
    const gerberFile = classified("board.GTL", "G04 test*");
    const result = {
      ...parseKicadSchematic(minimalSchematic, schematicFile.id, schematicFile.name),
      diagnostics: []
    };
    const stages = buildIntakePipelineStages(
      input([schematicFile, gerberFile], {
        ...emptyResults,
        kicadSchematicResults: { [schematicFile.id]: result }
      })
    );

    expect(stageStatus(stages, "normalization")).toBe("warning");
    expect(stageStatus(stages, "report")).toBe("warning");
  });
});
