import type { EngineeringReportConfidenceSummary } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";

function level(available: boolean, count = 0): EngineeringReportConfidenceSummary["level"] {
  if (available && count > 0) return "Strong";
  if (available) return "Moderate";
  return "Insufficient";
}

export function buildConfidenceSummary(project: NormalizedPCBProject): readonly EngineeringReportConfidenceSummary[] {
  return [
    {
      category: "File completeness confidence",
      level: project.completenessScore >= 75 ? "Strong" : project.completenessScore >= 45 ? "Moderate" : project.completenessScore > 0 ? "Limited" : "Insufficient",
      evidence: `${project.sourceFiles.length} uploaded file(s), completeness score ${project.completenessScore}/100.`,
      missingData: project.missingDataWarnings.map((warning) => warning.title).join(", ") || "No major missing data listed.",
      improvement: "Upload recommended schematic, PCB, BOM, placement, Gerber/drill, and IPC files where applicable."
    },
    {
      category: "Parser confidence",
      level: project.parserResult.stages.some((stage) => stage.status === "parsed") ? "Moderate" : "Limited",
      evidence: `${project.parserResult.stages.filter((stage) => stage.status === "parsed").length} parser stage(s) parsed.`,
      missingData: "Unsupported parser stages remain future work.",
      improvement: "Use supported KiCad, BOM, and placement files."
    },
    {
      category: "Board layout confidence",
      level: level(Boolean(project.board.kicadPcb), project.board.kicadPcb?.summary.footprintCount ?? 0),
      evidence: project.board.kicadPcb ? `${project.board.kicadPcb.summary.footprintCount} footprints and ${project.board.kicadPcb.summary.netCount} nets parsed.` : "No parsed PCB layout.",
      missingData: project.board.kicadPcb ? "Datasheets and full validation still missing." : ".kicad_pcb",
      improvement: "Provide .kicad_pcb with pad-net and outline data."
    },
    {
      category: "Schematic confidence",
      level: level(Boolean(project.schematic.kicadSchematic), project.schematic.kicadSchematic?.summary.symbolInstanceCount ?? 0),
      evidence: project.schematic.kicadSchematic ? `${project.schematic.kicadSchematic.summary.symbolInstanceCount} schematic symbols parsed.` : "No parsed schematic.",
      missingData: project.schematic.kicadSchematic ? "Schematic-to-PCB validation is not complete." : ".kicad_sch",
      improvement: "Provide schematic with symbol pins, labels, and properties."
    },
    {
      category: "BOM confidence",
      level: project.bom.bom && !project.bom.bom.unsupported ? "Moderate" : "Insufficient",
      evidence: project.bom.bom && !project.bom.bom.unsupported ? `${project.bom.bom.summary.rowCount} BOM row(s) parsed.` : "No supported BOM rows.",
      missingData: "MPN/current fields may be incomplete.",
      improvement: "Provide BOM with MPN, value, footprint, and current-rating fields."
    },
    {
      category: "Placement confidence",
      level: project.analysis.placement.available ? "Moderate" : "Insufficient",
      evidence: `${project.analysis.placement.components.length} placement component record(s).`,
      missingData: project.analysis.placement.coordinateSourceSummary.missingCoordinates ? "Some coordinates are missing." : "Mechanical constraints still missing.",
      improvement: "Provide pick-and-place data, PCB outline, and mechanical constraints."
    },
    {
      category: "Net classification confidence",
      level: project.netInventory.available ? "Moderate" : "Insufficient",
      evidence: `${project.netInventory.summary.totalNets} net(s), ${project.netInventory.summary.classifiedNets} classified.`,
      missingData: "Name-based classification is not electrical validation.",
      improvement: "Provide schematic and PCB net data with clear names."
    },
    {
      category: "Power tree confidence",
      level: project.analysis.powerTree.available ? "Limited" : "Insufficient",
      evidence: `${project.analysis.powerTree.rails.length} rail(s), ${project.analysis.powerTree.regulators.length} regulator candidate(s).`,
      missingData: "Datasheets and current values are missing unless explicitly parsed.",
      improvement: "Provide BOM current data, regulator part numbers, and datasheets."
    },
    {
      category: "Firmware manual confidence",
      level: project.firmware.manual?.available ? "Limited" : "Insufficient",
      evidence: `${project.firmware.manual?.summary.pinMapEntries ?? 0} firmware pin-map entrie(s).`,
      missingData: "Datasheet pin mux and firmware behavior are not validated.",
      improvement: "Review MCU datasheet and schematic symbol pin names."
    },
    {
      category: "Overall report confidence",
      level: project.sourceFiles.length && project.completenessScore >= 45 ? "Moderate" : project.sourceFiles.length ? "Limited" : "Insufficient",
      evidence: "Report generated from parsed project files and deterministic analysis results.",
      missingData: "See missing data summary and limitations.",
      improvement: "Provide missing source files and perform manual engineering review."
    }
  ];
}
