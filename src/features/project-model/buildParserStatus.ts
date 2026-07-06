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
      status: filesByCategory(input, ["gerber", "gerber-x2"]).length
        ? "queued-for-future-parser"
        : "missing-required-file",
      fileIds: filesByCategory(input, ["gerber", "gerber-x2"]),
      confidence: "missing-data",
      message: "Gerber files are classified only; manufacturing artwork is not parsed.",
      requiredFuturePhase: "Future parser phase",
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
      status: filesByCategory(input, ["bom"]).length
        ? "queued-for-future-parser"
        : "missing-required-file",
      fileIds: filesByCategory(input, ["bom"]),
      confidence: "missing-data",
      message: "BOM rows are not parsed or generated in Phase 3.",
      requiredFuturePhase: "Future parser phase",
      blockingMissingFiles: filesByCategory(input, ["bom"]).length ? [] : ["BOM file"]
    },
    {
      id: "pick-and-place-parser",
      label: "Pick-and-place parser",
      status: filesByCategory(input, ["pick-and-place"]).length
        ? "queued-for-future-parser"
        : "missing-required-file",
      fileIds: filesByCategory(input, ["pick-and-place"]),
      confidence: "missing-data",
      message: "Placement rows are not parsed in Phase 3.",
      requiredFuturePhase: "Future parser phase",
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
