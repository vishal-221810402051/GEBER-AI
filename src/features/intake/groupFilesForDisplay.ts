import type { ClassifiedFile, FileCategory } from "./intakeTypes";
import type {
  IntakeDisplayFile,
  IntakeDisplayGroup,
  IntakeFileStatus,
  IntakeParserResult,
  IntakeParserResultMaps
} from "./intakeDisplayTypes";

const groupDefinitions: readonly Omit<IntakeDisplayGroup, "files" | "parsedCount" | "warningCount" | "failedCount">[] = [
  { id: "schematics", title: "Schematics", categories: ["kicad-schematic"] },
  { id: "manufacturing", title: "Gerber/package files", categories: ["gerber", "gerber-x2", "archive"] },
  {
    id: "noncanonical",
    title: "Noncanonical files",
    categories: [
      "bom",
      "drill",
      "easyeda-export",
      "ipc-netlist",
      "kicad-pcb",
      "kicad-project",
      "pick-and-place",
      "structured-table"
    ]
  },
  { id: "unknown", title: "Unknown / Unsupported", categories: ["unknown"] }
];

function resultForFile(
  file: ClassifiedFile,
  maps: IntakeParserResultMaps
): IntakeParserResult | undefined {
  if (file.category === "kicad-pcb") {
    return maps.kicadPcbResults[file.id];
  }

  if (file.category === "kicad-schematic") {
    return maps.kicadSchematicResults[file.id];
  }

  if (file.category === "bom") {
    return maps.bomResults[file.id];
  }

  if (file.category === "pick-and-place") {
    return maps.placementResults[file.id];
  }

  if (file.category === "gerber" || file.category === "gerber-x2") {
    return maps.gerberParserResults[file.id];
  }

  return undefined;
}

function supportsParser(category: FileCategory): boolean {
  return ["kicad-pcb", "kicad-schematic", "bom", "pick-and-place", "gerber", "gerber-x2"].includes(category);
}

function statusForFile(file: ClassifiedFile, result?: IntakeParserResult): {
  status: IntakeFileStatus;
  statusLabel: string;
} {
  if (file.category === "unknown") {
    return { status: "unsupported", statusLabel: "Unsupported" };
  }

  if (!supportsParser(file.category)) {
    if (file.category === "gerber" || file.category === "gerber-x2") {
      return {
        status: "metadata-only",
        statusLabel: file.sourceKind === "gerber-package-entry" ? "Extracted" : "Gerber detected"
      };
    }

    return { status: "metadata-only", statusLabel: "Metadata only" };
  }

  if (!result) {
    return { status: "recognized", statusLabel: "Recognized" };
  }

  if ("status" in result && (result.status === "parsed" || result.status === "parsed-with-warnings" || result.status === "failed")) {
    if (result.status === "failed") {
      return { status: "failed", statusLabel: "Gerber parser failed" };
    }

    if (result.status === "parsed-with-warnings" || result.geometryCoverage === "partial") {
      return { status: "warning", statusLabel: "Geometry partially parsed" };
    }

    return { status: "parsed", statusLabel: "Geometry parsed" };
  }

  if ("unsupported" in result && result.unsupported) {
    return { status: "unsupported", statusLabel: "Unsupported" };
  }

  if ("success" in result && !result.success) {
    return { status: "failed", statusLabel: "Failed" };
  }

  if (result.diagnostics.some((diagnostic) => diagnostic.severity === "critical" || diagnostic.severity === "high")) {
    return { status: "warning", statusLabel: "Parsed with warnings" };
  }

  return { status: "parsed", statusLabel: "Parsed" };
}

function summaryForResult(file: ClassifiedFile, result?: IntakeParserResult): readonly string[] {
  if (!result) {
    if (file.category === "gerber" || file.category === "gerber-x2") {
      return [
        file.sourceKind === "gerber-package-entry"
          ? `Package entry ${file.sourceRelativePath ?? file.name}`
          : "Direct Gerber upload",
        "Geometry parser pending"
      ];
    }

    return supportsParser(file.category)
      ? ["Parser result pending or unavailable"]
      : ["Recognized by filename or extension"];
  }

  if ("sheetCount" in result.summary) {
    return [
      `Symbols ${result.summary.symbolInstanceCount}`,
      `Labels ${result.summary.labelCount}`,
      `Wires ${result.summary.wireCount}`,
      `Sheets ${result.summary.sheetCount}`
    ];
  }

  if ("layerCount" in result.summary) {
    return [
      `Layers ${result.summary.layerCount}`,
      `Nets ${result.summary.netCount}`,
      `Footprints ${result.summary.footprintCount}`,
      `Vias ${result.summary.viaCount}`
    ];
  }

  if ("parsedReferenceCount" in result.summary) {
    return [
      `Rows ${result.summary.rowCount}`,
      `Refs ${result.summary.parsedReferenceCount}`,
      `Ambiguous ${result.summary.ambiguousRows}`
    ];
  }

  if ("primitiveCount" in result.summary || "lineCount" in result.summary) {
    const gerberResult = result as Extract<IntakeParserResult, { boundsMm: unknown }>;
    const filenameRole = (() => {
      const lower = gerberResult.sourceFileName.toLowerCase();
      if (/\.(gtl|cmp)$/.test(lower) || /f\.cu|top.*copper/.test(lower)) return "top copper";
      if (/\.(gbl|sol)$/.test(lower) || /b\.cu|bottom.*copper/.test(lower)) return "bottom copper";
      if (/edge\.cuts|outline|profile|\.gko$|\.gm1$/.test(lower)) return "profile";
      return undefined;
    })();
    const declaredRole = gerberResult.x2.fileAttributes.fileFunction
      ? [
          gerberResult.x2.fileAttributes.fileFunction.side,
          gerberResult.x2.fileAttributes.fileFunction.category === "copper"
            ? "copper"
            : gerberResult.x2.fileAttributes.fileFunction.category
        ].filter(Boolean).join(" ")
      : undefined;
    return [
      gerberResult.units ? `Units ${gerberResult.units}` : "Units unknown",
      `Apertures ${gerberResult.summary.apertureCount}`,
      `Primitives ${gerberResult.primitives.length}`,
      `Coverage ${gerberResult.geometryCoverage}`,
      gerberResult.x2.detected ? "X2 metadata parsed" : "No X2 attributes detected",
      gerberResult.x2.fileAttributes.fileFunction
        ? `Declared ${gerberResult.x2.fileAttributes.fileFunction.rawFunction}`
        : `X2 file attrs ${gerberResult.x2.summary.fileAttributeCount}`,
      `X2 aperture attrs ${gerberResult.x2.summary.apertureAttributeCount}`,
      `X2 object attrs ${gerberResult.x2.summary.objectAttributeCount}`,
      `Declared nets ${gerberResult.x2.summary.declaredNetCount}`,
      `Declared components ${gerberResult.x2.summary.declaredComponentReferenceCount}`,
      `Declared pins ${gerberResult.x2.summary.declaredPinCount}`,
      filenameRole && declaredRole && filenameRole !== declaredRole
        ? "X2 role differs from filename inference"
        : undefined,
      gerberResult.boundsMm
        ? `Bounds ${gerberResult.boundsMm.width.toFixed(3)} x ${gerberResult.boundsMm.height.toFixed(3)} mm`
        : "Bounds unavailable"
    ].filter(Boolean) as readonly string[];
  }

  return [
    `Rows ${result.summary.rowCount}`,
    `Top ${result.summary.topSideCount}`,
    `Bottom ${result.summary.bottomSideCount}`,
    `Unknown ${result.summary.unknownSideCount}`
  ];
}

function displayFile(file: ClassifiedFile, maps: IntakeParserResultMaps): IntakeDisplayFile {
  const parserResult = resultForFile(file, maps);
  const status = statusForFile(file, parserResult);

  return {
    file,
    parserResult,
    ...status,
    summaryItems: summaryForResult(file, parserResult),
    diagnostics: parserResult?.diagnostics ?? []
  };
}

export function groupFilesForDisplay(
  files: readonly ClassifiedFile[],
  maps: IntakeParserResultMaps
): readonly IntakeDisplayGroup[] {
  return groupDefinitions.map((definition) => {
    const displayFiles = files
      .filter((file) => definition.categories.includes(file.category))
      .map((file) => displayFile(file, maps));

    return {
      ...definition,
      files: displayFiles,
      parsedCount: displayFiles.filter((file) => file.status === "parsed" || file.status === "warning").length,
      warningCount: displayFiles.filter((file) => file.status === "warning" || file.diagnostics.length > 0).length,
      failedCount: displayFiles.filter((file) => file.status === "failed" || file.status === "unsupported").length
    };
  });
}
