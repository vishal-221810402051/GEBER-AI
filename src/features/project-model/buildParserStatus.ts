import type { ParserResult, ParserStage } from "../../domain";
import type { ProjectModelInput } from "./projectModelTypes";

function filesByCategory(input: ProjectModelInput, categories: readonly string[]) {
  return input.files
    .filter((file) => categories.includes(file.category))
    .map((file) => file.id);
}

function kicadPcbStatus(input: ProjectModelInput): ParserStage["status"] {
  const kicadFileIds = filesByCategory(input, ["kicad-pcb"]);

  if (kicadFileIds.length === 0) {
    return "missing-required-file";
  }

  const results = kicadFileIds
    .map((id) => input.kicadPcbResults[id])
    .filter(Boolean);

  if (results.some((result) => !result.success)) {
    return "failed";
  }

  if (results.length === kicadFileIds.length && results.every((result) => result.success)) {
    return "parsed";
  }

  return "queued-for-future-parser";
}

function kicadSchematicStatus(input: ProjectModelInput): ParserStage["status"] {
  const schematicFileIds = filesByCategory(input, ["kicad-schematic"]);

  if (schematicFileIds.length === 0) {
    return "missing-required-file";
  }

  const results = schematicFileIds
    .map((id) => input.kicadSchematicResults[id])
    .filter(Boolean);

  if (results.some((result) => !result.success)) {
    return "failed";
  }

  if (results.length === schematicFileIds.length && results.every((result) => result.success)) {
    return "parsed";
  }

  return "queued-for-future-parser";
}

function tableParserStatus(
  fileIds: readonly string[],
  resultsByFileId: Readonly<Record<string, { success: boolean; unsupported?: boolean }>>
): ParserStage["status"] {
  if (fileIds.length === 0) {
    return "missing-required-file";
  }

  const results = fileIds.map((id) => resultsByFileId[id]).filter(Boolean);

  if (results.some((result) => result.unsupported || !result.success)) {
    return "failed";
  }

  if (results.length === fileIds.length && results.every((result) => result.success)) {
    return "parsed";
  }

  return "queued-for-future-parser";
}

function gerberStatus(input: ProjectModelInput): ParserStage["status"] {
  const gerberFileIds = filesByCategory(input, ["gerber", "gerber-x2"]);

  if (gerberFileIds.length === 0) {
    return "missing-required-file";
  }

  const results = gerberFileIds
    .map((id) => input.gerberParserResults[id])
    .filter(Boolean);

  if (results.length < gerberFileIds.length) {
    return "queued-for-future-parser";
  }

  if (results.every((result) => result.status === "failed")) {
    return "failed";
  }

  if (results.some((result) => result.geometryCoverage === "partial")) {
    return "partial-geometry";
  }

  if (results.some((result) => result.status === "parsed-with-warnings" || result.status === "failed")) {
    return "parsed-with-warnings";
  }

  return "parsed";
}

export function buildParserStatus(input: ProjectModelInput): ParserResult {
  const hasFiles = input.files.length > 0;

  const stages: readonly ParserStage[] = [
    {
      id: "file-classification",
      label: "File classification",
      status: hasFiles ? "metadata-classified" : "waiting-for-files",
      fileIds: input.files.map((file) => file.id),
      confidence: hasFiles ? "direct" : "missing-data",
      message: hasFiles
        ? "File metadata has been classified by extension and filename patterns."
        : "Waiting for files before metadata classification can run.",
      requiredFuturePhase: "Phase 2",
      blockingMissingFiles: hasFiles ? [] : ["Project files"]
    },
    {
      id: "kicad-pcb-parser",
      label: "KiCad PCB parser",
      status: kicadPcbStatus(input),
      fileIds: filesByCategory(input, ["kicad-pcb"]),
      confidence: input.files.some((file) => file.category === "kicad-pcb")
        ? "direct"
        : "missing-data",
      message: "KiCad PCB parser reads layout-level data only. No schematic validation or electrical analysis is performed.",
      requiredFuturePhase: "Phase 4",
      blockingMissingFiles: filesByCategory(input, ["kicad-pcb"]).length
        ? []
        : [".kicad_pcb"]
    },
    {
      id: "kicad-schematic-parser",
      label: "KiCad schematic parser",
      status: kicadSchematicStatus(input),
      fileIds: filesByCategory(input, ["kicad-schematic"]),
      confidence: input.files.some((file) => file.category === "kicad-schematic")
        ? "direct"
        : "missing-data",
      message: "KiCad schematic parser reads schematic-level data only. No PCB comparison, electrical analysis, or firmware mapping is performed.",
      requiredFuturePhase: "Phase 5",
      blockingMissingFiles: filesByCategory(input, ["kicad-schematic"]).length
        ? []
        : [".kicad_sch"]
    },
    {
      id: "gerber-parser",
      label: "Gerber parser",
      status: gerberStatus(input),
      fileIds: filesByCategory(input, ["gerber", "gerber-x2"]),
      confidence: filesByCategory(input, ["gerber", "gerber-x2"]).length ? "direct" : "missing-data",
      message: "Gerber parser extracts supported RS-274X geometry and X2 metadata. Drill parsing, schematic correlation, and manufacturing validation are not implemented.",
      requiredFuturePhase: "Product Realignment Phase D2",
      blockingMissingFiles: filesByCategory(input, ["gerber", "gerber-x2"]).length
        ? []
        : ["Gerber files"]
    },
    {
      id: "excellon-drill-parser",
      label: "Excellon drill parser",
      status: filesByCategory(input, ["drill"]).length
        ? "queued-for-future-parser"
        : "missing-required-file",
      fileIds: filesByCategory(input, ["drill"]),
      confidence: "missing-data",
      message: "Drill file content parsing is not implemented in Phase 3.",
      requiredFuturePhase: "Future parser phase",
      blockingMissingFiles: filesByCategory(input, ["drill"]).length ? [] : ["Drill file"]
    },
    {
      id: "ipc-356-parser",
      label: "IPC-356 parser",
      status: filesByCategory(input, ["ipc-netlist"]).length
        ? "queued-for-future-parser"
        : "missing-required-file",
      fileIds: filesByCategory(input, ["ipc-netlist"]),
      confidence: "missing-data",
      message: "IPC-356 netlist parsing is not implemented in Phase 3.",
      requiredFuturePhase: "Future parser phase",
      blockingMissingFiles: filesByCategory(input, ["ipc-netlist"]).length
        ? []
        : ["IPC-356 netlist"]
    },
    {
      id: "bom-parser",
      label: "BOM parser",
      status: tableParserStatus(filesByCategory(input, ["bom"]), input.bomResults),
      fileIds: filesByCategory(input, ["bom"]),
      confidence: input.files.some((file) => file.category === "bom") ? "direct" : "missing-data",
      message: "BOM parser reads table-level data only. No BOM-to-PCB validation is performed.",
      requiredFuturePhase: "Phase 6",
      blockingMissingFiles: filesByCategory(input, ["bom"]).length ? [] : ["BOM file"]
    },
    {
      id: "pick-and-place-parser",
      label: "Pick-and-place parser",
      status: tableParserStatus(
        filesByCategory(input, ["pick-and-place"]),
        input.placementResults
      ),
      fileIds: filesByCategory(input, ["pick-and-place"]),
      confidence: input.files.some((file) => file.category === "pick-and-place") ? "direct" : "missing-data",
      message: "Pick-and-place parser reads table-level centroid data only. No placement-to-PCB validation is performed.",
      requiredFuturePhase: "Phase 6",
      blockingMissingFiles: filesByCategory(input, ["pick-and-place"]).length
        ? []
        : ["Pick-and-place file"]
    },
    {
      id: "easyeda-parser",
      label: "EasyEDA parser",
      status: filesByCategory(input, ["easyeda-export"]).length
        ? "queued-for-future-parser"
        : "skipped",
      fileIds: filesByCategory(input, ["easyeda-export"]),
      confidence: "missing-data",
      message: "EasyEDA support is future and technically conditional.",
      requiredFuturePhase: "Future parser phase",
      blockingMissingFiles: []
    },
    {
      id: "normalization",
      label: "Normalization",
      status: "parser-unavailable-current-phase",
      fileIds: [],
      confidence: "missing-data",
      message: "Only a metadata-level normalized project model exists in Phase 3.",
      requiredFuturePhase: "Phase 3 foundation, parser-backed later",
      blockingMissingFiles: []
    },
    {
      id: "analysis-engine",
      label: "Analysis engine",
      status: "parser-unavailable-current-phase",
      fileIds: [],
      confidence: "missing-data",
      message: "No PCB electrical analysis has been performed.",
      requiredFuturePhase: "Future analysis phase",
      blockingMissingFiles: []
    },
    {
      id: "firmware-mapper",
      label: "Firmware mapper",
      status: "parser-unavailable-current-phase",
      fileIds: [],
      confidence: "missing-data",
      message: "No firmware pins or peripherals have been extracted.",
      requiredFuturePhase: "Future firmware phase",
      blockingMissingFiles: []
    },
    {
      id: "report-generator",
      label: "Report generator",
      status: "parser-unavailable-current-phase",
      fileIds: [],
      confidence: "missing-data",
      message: "Report generation and exports are not implemented.",
      requiredFuturePhase: "Future reporting phase",
      blockingMissingFiles: []
    }
  ];

  return {
    status: hasFiles ? "metadata-classified" : "waiting-for-files",
    stages
  };
}
