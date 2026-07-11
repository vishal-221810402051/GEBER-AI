import { describe, expect, it } from "vitest";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { parseKicadPcb } from "../features/parsers/kicad-pcb/parseKicadPcb";
import { buildAiReviewInput } from "../features/ai/buildAiReviewInput";
import { minimalPcb } from "./fixtures/minimal.kicad_pcb";

function file(name: string, content = "test"): File {
  return new File([content], name, { type: "text/plain", lastModified: 1 });
}

describe("buildAiReviewInput", () => {
  it("builds minimized structured evidence without raw file contents", () => {
    const boardFile = classifyFile(file("board.kicad_pcb", minimalPcb));
    const completeness = calculateCompleteness([boardFile]);
    const pcbResult = parseKicadPcb(minimalPcb, boardFile.id, boardFile.name);
    const project = buildNormalizedProject({
      files: [boardFile],
      completeness,
      mode: "inspect",
      kicadPcbResults: { [boardFile.id]: pcbResult },
      kicadSchematicResults: {},
      bomResults: {},
      placementResults: {}
    });
    const input = buildAiReviewInput(project);
    const serialized = JSON.stringify(input);

    expect(input.project.name).toBe("board");
    expect(input.fileSummary.totalFiles).toBe(1);
    expect(input.evidenceSummary.length).toBeGreaterThan(0);
    expect(input.evidenceSummary[0].evidenceId).toBeTruthy();
    expect(input.missingDataWarnings.length).toBeGreaterThan(0);
    expect(serialized).not.toContain("(kicad_pcb");
    expect(serialized).not.toContain("gr_line");
  });
});
