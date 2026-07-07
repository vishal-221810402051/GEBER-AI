import type { NormalizedPCBProject } from "../../domain/project";
import type { ExportTable } from "./exportTypes";

export function buildComponentExport(project: NormalizedPCBProject): ExportTable {
  const footprintRows = (project.board.kicadPcb?.footprints ?? []).map((footprint) => ({
    source: "PCB layout",
    reference: footprint.reference ?? "unknown",
    value: footprint.value ?? "unknown",
    footprint: footprint.footprintName,
    x: footprint.x ?? "unknown",
    y: footprint.y ?? "unknown",
    side: footprint.layer ?? "unknown",
    nets: footprint.padNetNames.join("; ")
  }));
  const schematicRows = (project.schematic.kicadSchematic?.symbols ?? []).map((symbol) => ({
    source: "Schematic",
    reference: symbol.reference ?? "unknown",
    value: symbol.value ?? "unknown",
    footprint: symbol.footprint ?? "unknown",
    x: symbol.x ?? "unknown",
    y: symbol.y ?? "unknown",
    side: "not available",
    nets: "not available"
  }));
  const bomRows = (project.bom.bom?.rows ?? []).flatMap((row) =>
    row.referenceDesignators.map((reference) => ({
      source: "BOM",
      reference,
      value: row.value ?? "unknown",
      footprint: row.footprint ?? "unknown",
      x: "not available",
      y: "not available",
      side: "not available",
      nets: "not available"
    }))
  );

  return {
    filename: "geberai-component-summary.csv",
    columns: ["source", "reference", "value", "footprint", "x", "y", "side", "nets"],
    rows: [...footprintRows, ...schematicRows, ...bomRows]
  };
}
