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
  const hasSchematic = hasCategory(input, ["kicad-schematic"]);
  const hasGerber = hasCategory(input, ["gerber", "gerber-x2"]);
  const warnings: MissingDataWarning[] = [];

  if (!hasSchematic) {
    warnings.push(
      warning(
        "missing-kicad-schematic",
        "Missing KiCad schematic file",
        input.mode === "firmware" ? "critical" : "high",
        "No .kicad_sch file is currently selected.",
        "Schematic source is needed for intent, signal meaning, generated BOM evidence, and firmware guidance.",
        ["KiCad schematic file"],
        ["Schematic parser", "Firmware document", "Inspection report"]
      )
    );
  }

  if (!hasGerber) {
    warnings.push(
      warning(
        "missing-gerbers",
        "Missing Gerber/package files",
        input.mode === "inspect" || input.mode === "firmware" ? "high" : "medium",
        "No Gerber or Gerber-package file is currently selected.",
        "Gerber evidence is part of the locked schematic-plus-Gerber input package. Geometry parsing is deferred.",
        ["Gerber file or Gerber package"],
        ["Future Gerber parser"]
      )
    );
  }

  if (input.completeness.gerberOnlyLimitation) {
    warnings.push(
      warning(
        "gerber-only-limitation",
        "Gerber-only limitation",
        "high",
        "Current files appear limited to Gerber/package evidence.",
        "Gerber-only input cannot reconstruct full schematic intent, component semantics, generated BOM fields, or firmware pin purpose.",
        ["KiCad schematic file"],
        ["Schematic parser", "Inspection report", "Firmware document"]
      )
    );
  }

  if (hasGerber) {
    warnings.push(
      warning(
        "gerber-content-not-parsed",
        "Gerber geometry is not parsed yet",
        "medium",
        "Gerber/package files are detected and classified only.",
        "Manufacturing geometry, placement correlation, and schematic-to-Gerber validation require future Gerber parser phases.",
        ["Future Gerber parser"],
        ["Product Realignment D2-D5"]
      )
    );
  }

  return warnings;
}
