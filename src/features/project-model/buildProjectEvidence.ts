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
      title: "Project model is metadata-only",
      message:
        "The normalized project preview is built from file names, extensions, sizes, MIME metadata, selected mode, and completeness score.",
      affectedFuturePhases: ["Phase 4", "Future parser phases"]
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

  return { directEvidence, inferredEvidence, assumptions };
}
