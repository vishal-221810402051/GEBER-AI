import { describe, expect, it } from "vitest";
import type { ProjectMode } from "../domain/workflow";
import { buildProjectInputPackage } from "../domain/workflow";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import type { ClassifiedFile } from "../features/intake/intakeTypes";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { runProjectWorkflow } from "../features/workflow";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

function file(name: string, content = "test"): File {
  return new File([content], name, { type: "text/plain", lastModified: 1 });
}

function classified(name: string, content = "test"): ClassifiedFile {
  return classifyFile(file(name, content));
}

function projectWith(files: readonly ClassifiedFile[], mode: ProjectMode = "inspect") {
  const schematicResults = Object.fromEntries(
    files
      .filter((item) => item.category === "kicad-schematic")
      .map((item) => [
        item.id,
        parseKicadSchematic(minimalSchematic, item.id, item.name)
      ])
  );

  return buildNormalizedProject({
    files,
    completeness: calculateCompleteness(files),
    mode,
    kicadPcbResults: {},
    kicadSchematicResults: schematicResults,
    bomResults: {},
    placementResults: {}
  });
}

describe("project workflow orchestrator", () => {
  it("blocks Inspect without schematic evidence", () => {
    const files = [classified("top.gtl", "G04 test*")];
    const result = runProjectWorkflow({
      mode: "inspect",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files)
    });

    expect(result.status).toBe("blocked");
    if (result.status !== "blocked") return;
    expect(result.missingInputs).toContain("schematic files");
  });

  it("blocks Inspect without Gerber/package evidence", () => {
    const files = [classified("main.kicad_sch", minimalSchematic)];
    const result = runProjectWorkflow({
      mode: "inspect",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files)
    });

    expect(result.status).toBe("blocked");
    if (result.status !== "blocked") return;
    expect(result.missingInputs).toContain("Gerber/package files");
  });

  it("selects the existing engineering report for ready Inspect workflows", () => {
    const files = [
      classified("main.kicad_sch", minimalSchematic),
      classified("top.gtl", "G04 test*")
    ];
    const result = runProjectWorkflow({
      mode: "inspect",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files)
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.outputKind).toBe("engineering-report");
    if (result.outputKind !== "engineering-report") return;
    expect(result.mode).toBe("inspect");
    expect(result.output.available).toBe(true);
    expect(result.generatedBomStatus).toBe("deferred");
    expect(result.limitations).toContain("Gerber geometry parsing is not implemented.");
    expect(result.limitations).toContain("Generated BOM implementation is deferred.");
  });

  it("blocks Firmware without schematic evidence", () => {
    const files = [classified("top.gtl", "G04 test*")];
    const result = runProjectWorkflow({
      mode: "firmware",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files, "firmware")
    });

    expect(result.status).toBe("blocked");
    if (result.status !== "blocked") return;
    expect(result.missingInputs).toContain("schematic files");
  });

  it("blocks Firmware without Gerber/package evidence", () => {
    const files = [classified("main.kicad_sch", minimalSchematic)];
    const result = runProjectWorkflow({
      mode: "firmware",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files, "firmware")
    });

    expect(result.status).toBe("blocked");
    if (result.status !== "blocked") return;
    expect(result.missingInputs).toContain("Gerber/package files");
  });

  it("selects the existing firmware manual for ready Firmware workflows", () => {
    const files = [
      classified("main.kicad_sch", minimalSchematic),
      classified("top.gtl", "G04 test*")
    ];
    const result = runProjectWorkflow({
      mode: "firmware",
      inputPackage: buildProjectInputPackage(files),
      normalizedProject: projectWith(files, "firmware")
    });

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.outputKind).toBe("firmware-manual");
    if (result.outputKind !== "firmware-manual") return;
    expect(result.mode).toBe("firmware");
    expect(result.output.available).toBe(true);
    expect(result.limitations).toContain("Gerber content is not parsed yet.");
    expect(result.limitations).toContain("Firmware guidance is not proof of pin correctness.");
  });
});
