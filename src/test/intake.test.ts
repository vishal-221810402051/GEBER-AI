import { describe, expect, it } from "vitest";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";

function file(name: string): File {
  return new File(["test"], name, { type: "text/plain", lastModified: 1 });
}

describe("file intake classification", () => {
  it("classifies key project file types", () => {
    expect(classifyFile(file("board.kicad_pcb")).category).toBe("kicad-pcb");
    expect(classifyFile(file("main.kicad_sch")).category).toBe("kicad-schematic");
    expect(classifyFile(file("top.gtl")).category).toBe("gerber");
    expect(classifyFile(file("project_bom.csv")).category).toBe("bom");
    expect(classifyFile(file("pick-place.csv")).category).toBe("pick-and-place");
    expect(classifyFile(file("notes.txt")).category).toBe("unknown");
  });

  it("scores completeness from classified files", () => {
    const files = [
      classifyFile(file("main.kicad_sch")),
      classifyFile(file("top.gtl"))
    ];
    const summary = calculateCompleteness(files);
    expect(summary.score).toBe(100);
    expect(summary.readinessLabel).toBe("Complete canonical package");
  });
});
