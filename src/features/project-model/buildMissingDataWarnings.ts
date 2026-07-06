import type { MissingDataSeverity, MissingDataWarning } from "../../domain";
import type { ProjectModelInput } from "./projectModelTypes";

function hasCategory(input: ProjectModelInput, categories: readonly string[]): boolean {
  return input.files.some((file) => categories.includes(file.category));
}

function warning(
  id: string,
  title: string,
  severity: MissingDataSeverity,
  message: string,
  whyItMatters: string,
  requiredFiles: readonly string[],
  affectedFuturePhases: readonly string[]
): MissingDataWarning {
  return {
    id,
    title,
    severity,
    confidence: "direct",
    message,
    whyItMatters,
    requiredFiles,
    affectedFuturePhases
  };
}

export function buildMissingDataWarnings(input: ProjectModelInput): readonly MissingDataWarning[] {
  const hasPcb = hasCategory(input, ["kicad-pcb"]);
  const hasSchematic = hasCategory(input, ["kicad-schematic"]);
  const hasBom = hasCategory(input, ["bom"]);
  const hasPlacement = hasCategory(input, ["pick-and-place"]);
  const hasDrill = hasCategory(input, ["drill"]);
  const hasGerber = hasCategory(input, ["gerber", "gerber-x2"]);
  const hasIpc = hasCategory(input, ["ipc-netlist"]);
  const warnings: MissingDataWarning[] = [];

  if (!hasPcb) {
    warnings.push(
      warning(
        "missing-kicad-pcb",
        "Missing KiCad PCB file",
        input.mode === "analyze" || input.mode === "firmware" ? "high" : "medium",
        "No .kicad_pcb file is currently selected.",
        "PCB source is needed for future board geometry, footprint, and PCB-side normalization.",
        [".kicad_pcb"],
        ["Phase 4", "Future analysis phases"]
      )
    );
  }

  if (!hasSchematic) {
    warnings.push(
      warning(
        "missing-kicad-schematic",
        "Missing KiCad schematic file",
        input.mode === "firmware" ? "critical" : "high",
        "No .kicad_sch file is currently selected.",
        "Schematic source is needed for intent, signal meaning, and trusted firmware pin mapping.",
        [".kicad_sch"],
        ["Future schematic parser", "Future firmware phase"]
      )
    );
  }

  if (!hasBom) {
    warnings.push(
      warning(
        "missing-bom",
        "Missing BOM",
        "medium",
        "No BOM file is currently selected.",
        "BOM validation requires a BOM file before part grouping or procurement review can happen.",
        ["BOM CSV/XLSX"],
        ["Future BOM parser", "Future reporting phase"]
      )
    );
  }

  if (!hasPlacement) {
    warnings.push(
      warning(
        "missing-placement",
        "Missing pick-and-place file",
        "medium",
        "No pick-and-place or centroid file is currently selected.",
        "Placement analysis requires PCB coordinates or pick-and-place data.",
        ["Pick-and-place / centroid file"],
        ["Future placement parser"]
      )
    );
  }

  if (!hasDrill) {
    warnings.push(
      warning(
        "missing-drill",
        "Missing drill file",
        "medium",
        "No Excellon drill file is currently selected.",
        "Drill data is needed for future hole, via, and fabrication completeness checks.",
        ["Excellon drill file"],
        ["Future manufacturing parser"]
      )
    );
  }

  if (!hasGerber) {
    warnings.push(
      warning(
        "missing-gerbers",
        "Missing Gerber files",
        "medium",
        "No Gerber manufacturing files are currently selected.",
        "Gerbers are needed for future manufacturing artwork review.",
        ["Gerber RS-274X / Gerber X2"],
        ["Future Gerber parser"]
      )
    );
  }

  if (!hasIpc) {
    warnings.push(
      warning(
        "missing-ipc-356",
        "Missing IPC-356 netlist",
        "info",
        "No IPC-356 netlist is currently selected.",
        "IPC-356 can improve future independent manufacturing net evidence, but it is optional.",
        ["IPC-356 netlist"],
        ["Future IPC parser", "Future analysis phases"]
      )
    );
  }

  if (input.completeness.gerberOnlyLimitation) {
    warnings.push(
      warning(
        "gerber-only-limitation",
        "Gerber-only limitation",
        "high",
        "Current files appear limited to Gerber and drill manufacturing data.",
        "Gerber-only input cannot reconstruct full schematic intent, component semantics, or firmware pin purpose.",
        [".kicad_sch", ".kicad_pcb", "BOM"],
        ["Future schematic parser", "Future analysis phases"]
      )
    );
  }

  if (input.mode === "firmware" && (!hasSchematic || !hasPcb)) {
    warnings.push(
      warning(
        "firmware-mode-missing-net-data",
        "Firmware mode cannot be trusted without schematic and PCB net data",
        "critical",
        "Firmware Mode is selected without both schematic and PCB files.",
        "Firmware mapping requires schematic and PCB net data before pin assignments can be trusted.",
        [".kicad_sch", ".kicad_pcb"],
        ["Future firmware phase"]
      )
    );
  }

  if (!hasSchematic || !hasPcb || !hasIpc) {
    warnings.push(
      warning(
        "electrical-analysis-requires-sources",
        "Full electrical analysis requires schematic, PCB, and netlist evidence",
        "medium",
        "The selected package is missing at least one source needed for future full electrical analysis.",
        "Future electrical analysis needs schematic intent, PCB implementation, and ideally independent netlist evidence.",
        [".kicad_sch", ".kicad_pcb", "IPC-356 netlist"],
        ["Future analysis phases"]
      )
    );
  }

  return warnings;
}
