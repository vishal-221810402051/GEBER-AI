import type { ProjectAssumption, ProjectEvidence } from "../../domain";
import type { ProjectModelInput } from "./projectModelTypes";

export function buildProjectEvidence(input: ProjectModelInput): {
  directEvidence: readonly ProjectEvidence[];
  inferredEvidence: readonly ProjectEvidence[];
  assumptions: readonly ProjectAssumption[];
} {
  const directEvidence = input.files
    .filter((file) => file.confidence === "direct")
    .map((file): ProjectEvidence => ({
      id: `direct-${file.id}`,
      kind: "direct-metadata",
      confidence: file.confidence,
      title: `${file.name} classified as ${file.categoryLabel}`,
      message: `File ${file.name} was classified from metadata only. Size ${file.sizeBytes} bytes, extension ${file.extension}.`,
      sourceFileIds: [file.id]
    }));

  const inferredEvidence = input.files
    .filter((file) => file.confidence !== "direct")
    .map((file): ProjectEvidence => ({
      id: `inferred-${file.id}`,
      kind: file.confidence === "missing-data" ? "missing-data" : "inferred-metadata",
      confidence: file.confidence,
      title: `${file.name} has ${file.categoryLabel} classification`,
      message: file.note,
      sourceFileIds: [file.id]
    }));

  const assumptions: ProjectAssumption[] = [
    {
      id: "metadata-only-model",
      confidence: "direct",
      title: "Project model is evidence-limited",
      message:
        "The normalized project combines file metadata and available local parser results. Gerber geometry parsing does not imply manufacturing validation.",
      affectedFuturePhases: ["Product Realignment D3", "Future result phases"]
    },
    {
      id: `selected-mode-${input.mode}`,
      confidence: "direct",
      title: `Selected mode is ${input.mode}`,
      message:
        "The selected mode affects missing-data warnings only. It does not start analysis.",
      affectedFuturePhases: ["Future analysis phases", "Future firmware phases"]
    }
  ];

  Object.values(input.kicadPcbResults).forEach((result) => {
    if (!result.success) {
      inferredEvidence.push({
        id: `kicad-pcb-failed-${result.sourceFileId}`,
        kind: "missing-data",
        confidence: "direct",
        title: `${result.sourceFileName} KiCad PCB parser failed`,
        message: result.diagnostics.map((item) => item.message).join(" "),
        sourceFileIds: [result.sourceFileId]
      });
      return;
    }

    directEvidence.push(
      {
        id: `kicad-pcb-layers-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.layerCount} layers from .kicad_pcb`,
        message:
          "Layer count is directly parsed from the KiCad PCB layout file. It is not schematic validation.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-pcb-nets-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.netCount} net declarations from board layout`,
        message:
          "Net declarations are layout-level parsed facts only. No schematic comparison has been performed.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-pcb-footprints-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.footprintCount} footprints from .kicad_pcb`,
        message:
          "Footprints are parsed from PCB layout only and are not schematic-validated components.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-pcb-vias-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.viaCount} vias from .kicad_pcb`,
        message: "Via count is a layout-level parsed fact only.",
        sourceFileIds: [result.sourceFileId]
      }
    );

    inferredEvidence.push({
      id: `kicad-pcb-outline-${result.sourceFileId}`,
      kind:
        result.summary.outlineStatus === "not-found"
          ? "missing-data"
          : "inferred-metadata",
      confidence: result.summary.boundingBox?.confidence ?? "missing-data",
      title: `Board outline status: ${result.summary.outlineStatus}`,
      message:
        result.summary.outlineStatus === "not-found"
          ? "No Edge.Cuts outline primitives were parsed."
          : "Board outline bounding box estimated from Edge.Cuts primitives.",
      sourceFileIds: [result.sourceFileId]
    });
  });

  Object.values(input.kicadSchematicResults).forEach((result) => {
    if (!result.success) {
      inferredEvidence.push({
        id: `kicad-schematic-failed-${result.sourceFileId}`,
        kind: "missing-data",
        confidence: "direct",
        title: `${result.sourceFileName} KiCad schematic parser failed`,
        message: result.diagnostics.map((item) => item.message).join(" "),
        sourceFileIds: [result.sourceFileId]
      });
      return;
    }

    directEvidence.push(
      {
        id: `kicad-schematic-symbols-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.symbolInstanceCount} schematic symbols from .kicad_sch`,
        message:
          "Schematic symbols are directly parsed from the schematic file. They are not PCB-compared.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-schematic-labels-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.labelCount} labels from schematic`,
        message:
          "Labels are schematic-level parsed facts. Full net solving is not complete.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-schematic-wires-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.wireCount} wire primitives`,
        message:
          "Wire primitives are parsed from the schematic. They are not PCB-compared yet.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-schematic-footprints-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `${result.summary.symbolsWithFootprint} symbols include footprint properties`,
        message:
          "Footprint properties are schematic metadata only and are not matched to PCB footprints in Phase 5.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `kicad-schematic-noconnect-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.noConnectCount} no-connect markers`,
        message:
          "No-connect markers are schematic-level parsed facts only.",
        sourceFileIds: [result.sourceFileId]
      }
    );
  });

  Object.values(input.gerberParserResults).forEach((result) => {
    if (result.status === "failed") {
      inferredEvidence.push({
        id: `gerber-failed-${result.sourceFileId}`,
        kind: "missing-data",
        confidence: "direct",
        title: `${result.sourceFileName} Gerber parser failed`,
        message: result.diagnostics.map((item) => item.message).join(" "),
        sourceFileIds: [result.sourceFileId]
      });
      return;
    }

    directEvidence.push(
      {
        id: `gerber-geometry-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.primitives.length} Gerber geometry primitive(s) from ${result.sourceFileName}`,
        message:
          "Gerber primitives are parsed RS-274X file geometry only. No schematic correlation, DRC, DFM, or manufacturing validation has been performed.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `gerber-apertures-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.apertureCount} Gerber aperture definition(s)`,
        message:
          "Supported circle, rectangle, obround, and polygon apertures are normalized to millimetres. Aperture macros are detected but not evaluated.",
        sourceFileIds: [result.sourceFileId]
      }
    );

    if (result.boundsMm) {
      directEvidence.push({
        id: `gerber-bounds-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed file bounds ${result.boundsMm.width.toFixed(3)} x ${result.boundsMm.height.toFixed(3)} mm`,
        message:
          "Bounds describe parsed layer geometry for this file only. They are not verified board dimensions.",
        sourceFileIds: [result.sourceFileId]
      });
    }
  });

  Object.values(input.bomResults).forEach((result) => {
    if (result.unsupported) {
      inferredEvidence.push({
        id: `bom-unsupported-${result.sourceFileId}`,
        kind: "missing-data",
        confidence: "direct",
        title: `BOM file recognized but ${result.sourceFileName} is not parsed`,
        message: "Spreadsheet parsing is not implemented in Phase 6.",
        sourceFileIds: [result.sourceFileId]
      });
      return;
    }

    directEvidence.push(
      {
        id: `bom-rows-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.rowCount} BOM rows from ${result.sourceFileName}`,
        message: "BOM data is table-level only and is not PCB-validated yet.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `bom-refs-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.parsedReferenceCount} reference designators from BOM rows`,
        message: "BOM reference parsing does not prove the references exist in PCB or schematic data.",
        sourceFileIds: [result.sourceFileId]
      }
    );
  });

  Object.values(input.placementResults).forEach((result) => {
    directEvidence.push(
      {
        id: `placement-rows-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `Parsed ${result.summary.rowCount} placement rows from ${result.sourceFileName}`,
        message: "Placement data is not compared against PCB coordinates yet.",
        sourceFileIds: [result.sourceFileId]
      },
      {
        id: `placement-bottom-${result.sourceFileId}`,
        kind: "direct-metadata",
        confidence: "direct",
        title: `${result.summary.bottomSideCount} placement rows are bottom-side`,
        message: "Side counts are parsed table facts only and do not prove assembly validity.",
        sourceFileIds: [result.sourceFileId]
      }
    );
  });

  return { directEvidence, inferredEvidence, assumptions };
}
