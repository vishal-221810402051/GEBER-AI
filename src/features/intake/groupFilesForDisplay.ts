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

  return undefined;
}

function supportsParser(category: FileCategory): boolean {
  return ["kicad-pcb", "kicad-schematic", "bom", "pick-and-place"].includes(category);
}

function statusForFile(file: ClassifiedFile, result?: IntakeParserResult): {
  status: IntakeFileStatus;
  statusLabel: string;
} {
  if (file.category === "unknown") {
    return { status: "unsupported", statusLabel: "Unsupported" };
  }

  if (!supportsParser(file.category)) {
    return { status: "metadata-only", statusLabel: "Metadata only" };
  }

  if (!result) {
    return { status: "recognized", statusLabel: "Recognized" };
  }

  if ("unsupported" in result && result.unsupported) {
    return { status: "unsupported", statusLabel: "Unsupported" };
  }

  if (!result.success) {
    return { status: "failed", statusLabel: "Failed" };
  }

  if (result.diagnostics.some((diagnostic) => diagnostic.severity === "critical" || diagnostic.severity === "high")) {
    return { status: "warning", statusLabel: "Parsed with warnings" };
  }

  return { status: "parsed", statusLabel: "Parsed" };
}

function summaryForResult(file: ClassifiedFile, result?: IntakeParserResult): readonly string[] {
  if (!result) {
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
