import { describe, expect, it } from "vitest";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { parseKicadPcb } from "../features/parsers/kicad-pcb/parseKicadPcb";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { minimalPcb } from "./fixtures/minimal.kicad_pcb";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

function file(name: string): File {
  return new File(["test"], name, { type: "text/plain", lastModified: 1 });
}

describe("engineering report builder", () => {
  it("generates a report and risk matrix from normalized project data", () => {
    const files = [classifyFile(file("minimal.kicad_pcb")), classifyFile(file("minimal.kicad_sch"))];
    const project = buildNormalizedProject({
      files,
      completeness: calculateCompleteness(files),
      mode: "inspect",
      kicadPcbResults: { pcb: parseKicadPcb(minimalPcb, "pcb", "minimal.kicad_pcb") },
      kicadSchematicResults: { sch: parseKicadSchematic(minimalSchematic, "sch", "minimal.kicad_sch") },
      bomResults: {},
      placementResults: {},
      gerberParserResults: {}
    });

    expect(project.report.engineeringReport?.available).toBe(true);
    expect(project.report.engineeringReport?.riskMatrix.risks.length).toBeGreaterThan(0);
    expect(project.report.engineeringReport?.markdown).toContain("Engineering Report");
  });
});
