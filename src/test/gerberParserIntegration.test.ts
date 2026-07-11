import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildProjectInputPackage } from "../domain/workflow";
import { extractGerberPackage } from "../features/gerber-package";
import { classifyFile } from "../features/intake/classifyFile";
import { calculateCompleteness } from "../features/intake/completenessScore";
import type { IntakeParserResultMaps } from "../features/intake/intakeDisplayTypes";
import {
  buildIntakePipelineStages,
  deriveIntakeProcessingState
} from "../features/intake/intakePipelineStages";
import { groupFilesForDisplay } from "../features/intake/groupFilesForDisplay";
import { parseGerber } from "../features/parsers/gerber";
import { buildNormalizedProject } from "../features/project-model/buildNormalizedProject";
import { runProjectWorkflow } from "../features/workflow";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

const gerberSource = `%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
D10*
X000000Y000000D02*
X010000Y000000D01*
M02*`;

function maps(gerberId: string, gerberResult = parseGerber(gerberSource, gerberId, "top.gtl")): IntakeParserResultMaps {
  return {
    bomResults: {},
    gerberParserResults: { [gerberId]: gerberResult },
    kicadPcbResults: {},
    kicadSchematicResults: {},
    placementResults: {}
  };
}

function zipFile(entries: Record<string, Uint8Array>) {
  return new File([new Uint8Array(zipSync(entries))], "gerbers.zip", {
    type: "application/zip",
    lastModified: 1
  });
}

describe("Gerber parser integration", () => {
  it("parses direct Gerber files and surfaces inventory summaries", () => {
    const file = classifyFile(new File([gerberSource], "top.gtl", { lastModified: 1 }));
    const parserMaps = maps(file.id, parseGerber(gerberSource, file.id, file.name, file));
    const groups = groupFilesForDisplay([file], parserMaps);
    const gerber = groups.find((group) => group.id === "manufacturing")?.files[0];

    expect(gerber?.statusLabel).toBe("Geometry parsed");
    expect(gerber?.summaryItems.join(" ")).toContain("Apertures 1");
    expect(deriveIntakeProcessingState([file], parserMaps).active).toBe(false);
  });

  it("parses ZIP-extracted Gerber entries and preserves package source metadata", async () => {
    const extracted = await extractGerberPackage(zipFile({
      "layers/top.gtl": new TextEncoder().encode(gerberSource)
    }));
    const file = extracted.gerberFiles[0];
    const result = parseGerber(await file.file.text(), file.id, file.name, file);

    expect(result.sourceKind).toBe("gerber-package-entry");
    expect(result.sourcePackageName).toBe("gerbers.zip");
    expect(result.sourceRelativePath).toBe("layers/top.gtl");
    expect(result.summary.lineCount).toBe(1);
  });

  it("does not parse ZIP parent files as Gerber", () => {
    const archive = classifyFile(new File(["zip"], "gerbers.zip", { lastModified: 1 }));

    expect(archive.category).toBe("archive");
    expect(buildProjectInputPackage([archive]).gerberFiles).toEqual([]);
  });

  it("removes parser results from normalized summaries when package children are removed", async () => {
    const extracted = await extractGerberPackage(zipFile({
      "layers/top.gtl": new TextEncoder().encode(gerberSource)
    }));
    const file = extracted.gerberFiles[0];
    const result = parseGerber(await file.file.text(), file.id, file.name, file);
    const projectWithGerber = buildNormalizedProject({
      files: [file],
      completeness: calculateCompleteness([file]),
      mode: "inspect",
      bomResults: {},
      gerberParserResults: { [file.id]: result },
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    });
    const projectWithoutGerber = buildNormalizedProject({
      files: [],
      completeness: calculateCompleteness([]),
      mode: "inspect",
      bomResults: {},
      gerberParserResults: {},
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    });

    expect(projectWithGerber.gerber.summary.totalFiles).toBe(1);
    expect(projectWithoutGerber.gerber.summary.totalFiles).toBe(0);
  });

  it("adds Gerber as a real parser job in the intake pipeline", () => {
    const file = classifyFile(new File([gerberSource], "top.gtl", { lastModified: 1 }));
    const emptyMaps: IntakeParserResultMaps = {
      bomResults: {},
      gerberParserResults: {},
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
    };
    const active = deriveIntakeProcessingState([file], emptyMaps);

    expect(active.active).toBe(true);
    expect(active.progress).toBe(0);

    const project = buildNormalizedProject({
      files: [file],
      completeness: calculateCompleteness([file]),
      mode: "inspect",
      ...maps(file.id, parseGerber(gerberSource, file.id, file.name, file))
    });
    const stages = buildIntakePipelineStages({
      files: [file],
      mode: "inspect",
      normalizedProject: project,
      parserResults: maps(file.id, parseGerber(gerberSource, file.id, file.name, file)),
      processingState: deriveIntakeProcessingState([file], maps(file.id))
    });

    expect(stages.find((stage) => stage.id === "gerber-parser")?.status).toBe("complete");
  });

  it("keeps workflow outputs as report/manual and does not create BOM or schematic-Gerber correlation", () => {
    const schematic = classifyFile(new File([minimalSchematic], "main.kicad_sch", { lastModified: 1 }));
    const gerber = classifyFile(new File([gerberSource], "top.gtl", { lastModified: 1 }));
    const schematicResult = parseKicadSchematic(minimalSchematic, schematic.id, schematic.name);
    const gerberResult = parseGerber(gerberSource, gerber.id, gerber.name, gerber);
    const project = buildNormalizedProject({
      files: [schematic, gerber],
      completeness: calculateCompleteness([schematic, gerber]),
      mode: "inspect",
      bomResults: {},
      gerberParserResults: { [gerber.id]: gerberResult },
      kicadPcbResults: {},
      kicadSchematicResults: { [schematic.id]: schematicResult },
      placementResults: {}
    });
    const result = runProjectWorkflow({
      mode: "inspect",
      inputPackage: buildProjectInputPackage([schematic, gerber]),
      normalizedProject: project
    });

    expect(result.status).toBe("ready");
    expect(result.status === "ready" ? result.outputKind : undefined).toBe("engineering-report");
    expect(project.bom.status).toBe("future-model");
    expect(project.directEvidence.map((item) => item.title).join(" ")).not.toMatch(/matched|correlated/i);
  });
});
