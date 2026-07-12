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
  const gerberFileCount = input.files.filter((file) => file.category === "gerber" || file.category === "gerber-x2").length;
  const gerberResults = Object.values(input.gerberParserResults);
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
        "Gerber evidence is part of the locked schematic-plus-Gerber input package.",
        ["Gerber file or Gerber package"],
        ["Gerber RS-274X parser"]
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

  if (hasGerber && gerberResults.length < gerberFileCount) {
    warnings.push(
      warning(
        "gerber-parser-pending",
        "Gerber parser is still running",
        "medium",
        "One or more Gerber files have not finished local geometry parsing.",
        "Inspection output must separate input readiness from parser coverage until Gerber parsing is complete.",
        ["Gerber file or Gerber package"],
        ["Product Realignment D2"]
      )
    );
  }

  if (gerberResults.length > 0 && gerberResults.every((result) => result.status === "failed")) {
    warnings.push(
      warning(
        "gerber-geometry-unavailable",
        "Gerber geometry unavailable",
        "high",
        "All loaded Gerber files failed supported RS-274X geometry parsing.",
        "Input readiness is present, but Gerber findings must not be claimed when geometry is unavailable.",
        ["Supported RS-274X Gerber file"],
        ["Product Realignment D2 hardening"]
      )
    );
  } else if (gerberResults.some((result) => result.status === "parsed-with-warnings" || result.geometryCoverage === "partial")) {
    warnings.push(
      warning(
        "gerber-geometry-partial",
        "Gerber geometry partially parsed",
        "medium",
        "At least one Gerber file has parser warnings or partial geometry coverage.",
        "Unsupported macros, malformed or unknown X2 attributes, and diagnostics can limit geometry evidence.",
        ["Supported RS-274X Gerber file"],
        ["Product Realignment D2 hardening", "Product Realignment D3 hardening"]
      )
    );
  }

  return warnings;
}
