import { describe, expect, it } from "vitest";
import type { ClassifiedFile } from "../features/intake/intakeTypes";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import {
  buildIntakePipelineStages,
  deriveIntakeProcessingState
} from "../features/intake/intakePipelineStages";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { parseKicadPcb } from "../features/parsers/kicad-pcb/parseKicadPcb";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { minimalPcb } from "./fixtures/minimal.kicad_pcb";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";
import type { IntakeParserResultMaps } from "../features/intake/intakeDisplayTypes";

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

function input(files: readonly ClassifiedFile[], parserResults: IntakeParserResultMaps = emptyResults) {
  const completeness = calculateCompleteness(files);
  const normalizedProject = buildNormalizedProject({
    files,
    completeness,
    mode: "basic",
    ...parserResults
  });

  return {
    files,
    mode: "basic" as const,
    normalizedProject,
    parserResults,
    processingState: deriveIntakeProcessingState(files, parserResults)
  };
}

function stageStatus(stages: ReturnType<typeof buildIntakePipelineStages>, id: string) {
  return stages.find((stage) => stage.id === id)?.status;
}

describe("intake pipeline stages", () => {
  it("keeps the pipeline idle or pending when no files are selected", () => {
    const stages = buildIntakePipelineStages(input([]));

    expect(stageStatus(stages, "files")).toBe("idle");
    expect(stageStatus(stages, "classification")).toBe("pending");
    expect(stageStatus(stages, "pcb-parser")).toBe("not-applicable");
    expect(stageStatus(stages, "report")).toBe("pending");
  });

  it("shows real active processing when parser inputs lack results", () => {
    const boardFile = classified("board.kicad_pcb", minimalPcb);
    const processingState = deriveIntakeProcessingState([boardFile], emptyResults);
    const stages = buildIntakePipelineStages(input([boardFile]));

    expect(processingState.active).toBe(true);
    expect(processingState.progress).toBe(0);
    expect(stageStatus(stages, "pcb-parser")).toBe("active");
  });

  it("marks a parsed PCB complete when the parser result has no diagnostics", () => {
    const boardFile = classified("board.kicad_pcb", minimalPcb);
    const result = {
      ...parseKicadPcb(minimalPcb, boardFile.id, boardFile.name),
      diagnostics: []
    };
    const stages = buildIntakePipelineStages(
      input([boardFile], {
        ...emptyResults,
        kicadPcbResults: { [boardFile.id]: result }
      })
    );

    expect(stageStatus(stages, "pcb-parser")).toBe("complete");
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

  it("maps parser diagnostics to warning and parser failure to error", () => {
    const boardFile = classified("board.kicad_pcb", minimalPcb);
    const parsed = parseKicadPcb(minimalPcb, boardFile.id, boardFile.name);
    const warningStages = buildIntakePipelineStages(
      input([boardFile], {
        ...emptyResults,
        kicadPcbResults: {
          [boardFile.id]: {
            ...parsed,
            diagnostics: [
              {
                severity: "high",
                message: "Synthetic test diagnostic",
                confidence: "direct",
                parserStage: "kicad-pcb-parser"
              }
            ]
          }
        }
      })
    );
    const errorStages = buildIntakePipelineStages(
      input([boardFile], {
        ...emptyResults,
        kicadPcbResults: {
          [boardFile.id]: {
            ...parsed,
            success: false
          }
        }
      })
    );

    expect(stageStatus(warningStages, "pcb-parser")).toBe("warning");
    expect(stageStatus(errorStages, "pcb-parser")).toBe("error");
  });

  it("marks report available with missing-data limitations as warning", () => {
    const boardFile = classified("board.kicad_pcb", minimalPcb);
    const result = {
      ...parseKicadPcb(minimalPcb, boardFile.id, boardFile.name),
      diagnostics: []
    };
    const stages = buildIntakePipelineStages(
      input([boardFile], {
        ...emptyResults,
        kicadPcbResults: { [boardFile.id]: result }
      })
    );

    expect(stageStatus(stages, "normalization")).toBe("warning");
    expect(stageStatus(stages, "report")).toBe("warning");
  });
});
