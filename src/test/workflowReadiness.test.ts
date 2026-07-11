import { describe, expect, it } from "vitest";
import {
  buildProjectInputPackage,
  PROJECT_MODE_DEFINITIONS,
  type LocalDesignFile
} from "../domain/workflow";
import { deriveWorkflowReadiness } from "../features/workflow";

function localFile(id: string, category: string): LocalDesignFile {
  return {
    id,
    name: id,
    category
  };
}

describe("workflow readiness", () => {
  it("blocks Inspect without schematic evidence", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("top.gtl", "gerber")
    ]);
    const readiness = deriveWorkflowReadiness("inspect", inputPackage);

    expect(readiness.ready).toBe(false);
    expect(readiness.missingInputs).toContain("schematic files");
    expect(readiness.actionLabel).toBe(PROJECT_MODE_DEFINITIONS.inspect.actionLabel);
  });

  it("blocks Inspect without Gerber/package evidence", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("main.kicad_sch", "kicad-schematic")
    ]);
    const readiness = deriveWorkflowReadiness("inspect", inputPackage);

    expect(readiness.ready).toBe(false);
    expect(readiness.missingInputs).toContain("Gerber/package files");
  });

  it("marks Inspect ready with schematic plus Gerber evidence and preserves Gerber limitations", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("main.kicad_sch", "kicad-schematic"),
      localFile("top.gtl", "gerber")
    ]);
    const readiness = deriveWorkflowReadiness("inspect", inputPackage);

    expect(readiness.ready).toBe(true);
    expect(readiness.missingInputs).toEqual([]);
    expect(readiness.warnings).toContain("Gerber geometry is not parsed yet.");
  });

  it("blocks Firmware without schematic evidence", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("gerbers.zip", "archive")
    ]);
    const readiness = deriveWorkflowReadiness("firmware", inputPackage);

    expect(readiness.ready).toBe(false);
    expect(readiness.missingInputs).toContain("schematic files");
  });

  it("blocks Firmware without Gerber/package evidence", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("main.kicad_sch", "kicad-schematic")
    ]);
    const readiness = deriveWorkflowReadiness("firmware", inputPackage);

    expect(readiness.ready).toBe(false);
    expect(readiness.missingInputs).toContain("Gerber/package files");
    expect(readiness.warnings).toContain("Datasheet review remains required.");
  });

  it("keeps the canonical package limited to schematic and Gerber/package files", () => {
    const inputPackage = buildProjectInputPackage([
      localFile("main.kicad_sch", "kicad-schematic"),
      localFile("top.gtl", "gerber"),
      localFile("assembly.csv", "bom"),
      localFile("placement.csv", "pick-and-place"),
      localFile("board.kicad_pcb", "kicad-pcb"),
      localFile("board.ipc", "ipc-netlist"),
      localFile("easyeda.json", "easyeda-export")
    ]);

    expect(Object.keys(inputPackage)).toEqual(["schematicFiles", "gerberFiles"]);
    expect(inputPackage.schematicFiles.map((file) => file.category)).toEqual(["kicad-schematic"]);
    expect(inputPackage.gerberFiles.map((file) => file.category)).toEqual(["gerber"]);
  });
});
