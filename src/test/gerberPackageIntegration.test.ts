import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildProjectInputPackage } from "../domain/workflow";
import {
  extractGerberPackage,
  removeGerberPackageChildren
} from "../features/gerber-package";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import { deriveWorkflowReadiness } from "../features/workflow";

const encoder = new TextEncoder();

function bytes(text: string) {
  return encoder.encode(text);
}

function zipFile(entries: Record<string, Uint8Array>) {
  return new File([new Uint8Array(zipSync(entries))], "gerbers.zip", {
    type: "application/zip",
    lastModified: 1
  });
}

describe("Gerber package workflow integration", () => {
  it("extracted Gerber files satisfy Inspect and Firmware readiness", async () => {
    const schematic = classifyFile(new File(["test"], "main.kicad_sch", { lastModified: 1 }));
    const packageResult = await extractGerberPackage(zipFile({
      "layers/top.gtl": bytes("G04 top*")
    }));
    const inputPackage = buildProjectInputPackage([
      schematic,
      ...packageResult.gerberFiles
    ]);

    expect(deriveWorkflowReadiness("inspect", inputPackage).ready).toBe(true);
    expect(deriveWorkflowReadiness("firmware", inputPackage).ready).toBe(true);
  });

  it("raw ZIP package parents are not canonical Gerber evidence", () => {
    const schematic = classifyFile(new File(["test"], "main.kicad_sch", { lastModified: 1 }));
    const archive = classifyFile(new File(["test"], "gerbers.zip", { lastModified: 1 }));
    const inputPackage = buildProjectInputPackage([schematic, archive]);

    expect(archive.category).toBe("archive");
    expect(inputPackage.gerberFiles).toEqual([]);
    expect(deriveWorkflowReadiness("inspect", inputPackage).ready).toBe(false);
  });

  it("package removal removes derived Gerber entries and preserves direct Gerbers", async () => {
    const directGerber = classifyFile(new File(["G04 direct*"], "direct.gtl", { lastModified: 1 }));
    const packageResult = await extractGerberPackage(zipFile({
      "top.gtl": bytes("G04 top*")
    }));
    const packageId = packageResult.record.id;
    const remaining = removeGerberPackageChildren([
      directGerber,
      ...packageResult.gerberFiles
    ], packageId);

    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(directGerber.id);
  });

  it("does not add extracted BOM, placement, PCB, or IPC entries to canonical input", async () => {
    const packageResult = await extractGerberPackage(zipFile({
      "bom.csv": bytes("Reference,Value"),
      "pick-place.csv": bytes("Ref,X,Y"),
      "board.kicad_pcb": bytes("(kicad_pcb)"),
      "board.ipc": bytes("P  JOB"),
      "top.gtl": bytes("G04 top*")
    }));
    const inputPackage = buildProjectInputPackage(packageResult.gerberFiles);

    expect(packageResult.gerberFiles).toHaveLength(1);
    expect(inputPackage.gerberFiles).toHaveLength(1);
    expect(packageResult.gerberFiles.map((file) => file.sourceRelativePath)).toEqual(["top.gtl"]);
  });

  it("scores package-extracted Gerber evidence as canonical Gerber evidence", async () => {
    const schematic = classifyFile(new File(["test"], "main.kicad_sch", { lastModified: 1 }));
    const packageResult = await extractGerberPackage(zipFile({
      "top.gtl": bytes("G04 top*")
    }));
    const summary = calculateCompleteness([
      schematic,
      ...packageResult.gerberFiles
    ]);

    expect(summary.score).toBe(100);
    expect(summary.readinessLabel).toBe("Complete canonical package");
  });
});
