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
      improvement: "Provide schematic and Gerber/package inputs; future phases will add Gerber geometry and schematic-derived BOM evidence."
    },
    {
      category: "Parser confidence",
      level: project.parserResult.stages.some((stage) => stage.status === "parsed") ? "Moderate" : "Limited",
      evidence: `${project.parserResult.stages.filter((stage) => stage.status === "parsed").length} parser stage(s) parsed.`,
      missingData: "Unsupported parser stages remain future work.",
      improvement: "Use supported schematic files now; Gerber/package files are currently detection-only."
    },
    {
      category: "Board layout confidence",
      level: level(Boolean(project.board.kicadPcb), project.board.kicadPcb?.summary.footprintCount ?? 0),
      evidence: project.board.kicadPcb ? `${project.board.kicadPcb.summary.footprintCount} footprints and ${project.board.kicadPcb.summary.netCount} nets parsed.` : "No parsed PCB layout.",
      missingData: project.board.kicadPcb ? "Datasheets and full validation still missing." : "Gerber geometry parser not implemented.",
      improvement: "Wait for future Gerber geometry parsing before expecting board outline, copper, pad, or placement facts."
    },
    {
      category: "Schematic confidence",
      level: level(Boolean(project.schematic.kicadSchematic), project.schematic.kicadSchematic?.summary.symbolInstanceCount ?? 0),
      evidence: project.schematic.kicadSchematic ? `${project.schematic.kicadSchematic.summary.symbolInstanceCount} schematic symbols parsed.` : "No parsed schematic.",
      missingData: project.schematic.kicadSchematic ? "Schematic-to-Gerber validation is not complete." : ".kicad_sch",
      improvement: "Provide schematic with symbol pins, labels, and properties."
    },
    {
      category: "BOM confidence",
      level: project.bom.bom && !project.bom.bom.unsupported ? "Moderate" : "Insufficient",
      evidence: project.bom.bom && !project.bom.bom.unsupported ? `${project.bom.bom.summary.rowCount} BOM row(s) parsed.` : "No supported BOM rows.",
      missingData: "Schematic-derived BOM generation is deferred; MPN/current fields remain unknown unless already supported by evidence.",
      improvement: "Use schematic symbol properties when the generated BOM phase is implemented; missing fields must stay unknown."
    },
    {
      category: "Placement confidence",
      level: project.analysis.placement.available ? "Moderate" : "Insufficient",
      evidence: `${project.analysis.placement.components.length} placement component record(s).`,
      missingData: project.analysis.placement.coordinateSourceSummary.missingCoordinates ? "Exact placement coordinates are unavailable." : "Mechanical constraints still missing.",
      improvement: "Treat exact placement correlation as unavailable until parsed Gerber attributes or future physical evidence support it."
    },
    {
      category: "Net classification confidence",
      level: project.netInventory.available ? "Moderate" : "Insufficient",
      evidence: `${project.netInventory.summary.totalNets} net(s), ${project.netInventory.summary.classifiedNets} classified.`,
      missingData: "Name-based classification is not electrical validation.",
      improvement: "Provide schematic evidence and future parsed Gerber attributes where net-level correlation is supported."
    },
    {
      category: "Power tree confidence",
      level: project.analysis.powerTree.available ? "Limited" : "Insufficient",
      evidence: `${project.analysis.powerTree.rails.length} rail(s), ${project.analysis.powerTree.regulators.length} regulator candidate(s).`,
      missingData: "Datasheets and current values are missing unless explicitly parsed.",
      improvement: "Use schematic properties and datasheets; generated BOM/current extraction is deferred."
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
