import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildProjectInputPackage } from "../domain/workflow";
import { extractGerberPackage } from "../features/gerber-package";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import { groupFilesForDisplay } from "../features/intake/groupFilesForDisplay";
import { parseGerber } from "../features/parsers/gerber";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { runProjectWorkflow } from "../features/workflow";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

const x2Source = `%FSLAX24Y24*%
%MOMM*%
%TF.FileFunction,Copper,L1,Top*%
%TA.AperFunction,ComponentPad*%
%ADD10C,0.100*%
D10*
%TO.C,U1*%
%TO.P,U1,1*%
%TO.N,RESET*%
X000000Y000000D03*
M02*`;

function zipFile(entries: Record<string, Uint8Array>) {
  return new File([new Uint8Array(zipSync(entries))], "x2.zip", {
    type: "application/zip",
    lastModified: 1
  });
}

describe("Gerber X2 integration", () => {
  it("keeps X1 Gerber compatible with no X2 attributes detected", () => {
    const result = parseGerber("%FSLAX24Y24*%\n%MOMM*%\n%ADD10C,0.1*%\nD10*\nX000000Y000000D03*\nM02*", "x1", "top.gtl");

    expect(result.x2.detected).toBe(false);
    expect(result.x2.summary.semanticCoverage).toBe("none");
  });

  it("parses direct X2 Gerber and surfaces inventory metadata", () => {
    const file = classifyFile(new File([x2Source], "top.gtl", { lastModified: 1 }));
    const result = parseGerber(x2Source, file.id, file.name, file);
    const groups = groupFilesForDisplay([file], {
      bomResults: {},
      gerberParserResults: { [file.id]: result },
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    });
    const item = groups.find((group) => group.id === "manufacturing")?.files[0];

    expect(item?.summaryItems).toContain("X2 metadata parsed");
    expect(item?.summaryItems).toContain("Declared Copper");
    expect(item?.summaryItems).toContain("Declared nets 1");
    expect(item?.summaryItems).toContain("Declared components 1");
    expect(item?.summaryItems).toContain("Declared pins 1");
  });

  it("parses ZIP-extracted X2 Gerber and preserves package source metadata", async () => {
    const extracted = await extractGerberPackage(zipFile({
      "layers/top.gtl": new TextEncoder().encode(x2Source)
    }));
    const file = extracted.gerberFiles[0];
    const result = parseGerber(await file.file.text(), file.id, file.name, file);

    expect(result.sourceKind).toBe("gerber-package-entry");
    expect(result.sourcePackageName).toBe("x2.zip");
    expect(result.x2.fileAttributes.fileFunction?.rawFunction).toBe("Copper");
  });

  it("adds project-level X2 summary without schematic correlation or BOM rows", () => {
    const schematic = classifyFile(new File([minimalSchematic], "main.kicad_sch", { lastModified: 1 }));
    const gerber = classifyFile(new File([x2Source], "top.gtl", { lastModified: 1 }));
    const project = buildNormalizedProject({
      files: [schematic, gerber],
      completeness: calculateCompleteness([schematic, gerber]),
      mode: "inspect",
      bomResults: {},
      gerberParserResults: { [gerber.id]: parseGerber(x2Source, gerber.id, gerber.name, gerber) },
      kicadPcbResults: {},
      kicadSchematicResults: { [schematic.id]: parseKicadSchematic(minimalSchematic, schematic.id, schematic.name) },
      placementResults: {}
    });
    const workflow = runProjectWorkflow({
      mode: "inspect",
      inputPackage: buildProjectInputPackage([schematic, gerber]),
      normalizedProject: project
    });

    expect(project.gerber.summary.x2.x2FileCount).toBe(1);
    expect(project.gerber.summary.x2.declaredNetNames).toContain("RESET");
    expect(project.gerber.summary.x2.declaredComponentReferences).toContain("U1");
    expect(project.bom.status).toBe("future-model");
    expect(project.directEvidence.map((item) => item.message).join(" ")).not.toMatch(/validated against schematic|matches schematic/i);
    expect(workflow.status).toBe("ready");
    expect(workflow.status === "ready" ? workflow.outputKind : undefined).toBe("engineering-report");
  });

  it("does not parse ZIP parents or Excellon drill files as X2 Gerber", () => {
    const archive = classifyFile(new File(["zip"], "gerbers.zip", { lastModified: 1 }));
    const drill = classifyFile(new File(["M48"], "board.drl", { lastModified: 1 }));

    expect(archive.category).toBe("archive");
    expect(drill.category).toBe("drill");
    expect(buildProjectInputPackage([archive, drill]).gerberFiles).toEqual([]);
  });

  it("keeps filename versus X2 file-function conflicts visible", () => {
    const source = x2Source.replace("%TF.FileFunction,Copper,L1,Top*%", "%TF.FileFunction,Copper,L2,Bot*%");
    const file = classifyFile(new File([source], "top.gtl", { lastModified: 1 }));
    const result = parseGerber(source, file.id, file.name, file);
    const project = buildNormalizedProject({
      files: [file],
      completeness: calculateCompleteness([file]),
      mode: "inspect",
      bomResults: {},
      gerberParserResults: { [file.id]: result },
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    });
    const groups = groupFilesForDisplay([file], {
      bomResults: {},
      gerberParserResults: { [file.id]: result },
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    });

    expect(project.gerber.summary.x2.conflictingFileClassifications).toHaveLength(1);
    expect(groups.find((group) => group.id === "manufacturing")?.files[0].summaryItems).toContain("X2 role differs from filename inference");
  });
});
