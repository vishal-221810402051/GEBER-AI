import type { EngineeringReportSection, EngineeringReportTable } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";

function table(title: string, columns: readonly string[], rows: readonly (readonly string[])[]): EngineeringReportTable {
  return { title, columns, rows };
}

export function buildReportSections(project: NormalizedPCBProject): readonly EngineeringReportSection[] {
  const firmware = project.firmware.manual;
  return [
    {
      id: "uploaded-files",
      title: "Uploaded File Summary",
      summary: `${project.sourceFiles.length} source file(s) are present in the normalized project.`,
      subsections: [{
        title: "Parsed file inventory",
        body: ["Uploaded file metadata and classification are directly captured from local browser intake."],
        tables: [table("Files", ["Name", "Category", "Confidence", "Size"], project.sourceFiles.map((file) => [file.name, file.categoryLabel, file.classificationConfidence, `${file.sizeBytes}`]))]
      }],
      findings: []
    },
    {
      id: "completeness",
      title: "File Completeness and Readiness",
      summary: `Completeness score is ${project.completenessScore}/100 (${project.readinessLabel}).`,
      subsections: [],
      findings: []
    },
    {
      id: "parser-status",
      title: "Parser Status Summary",
      summary: `${project.parserResult.stages.length} parser stage(s) are tracked.`,
      subsections: [{
        title: "Parser stages",
        body: ["Parser status is deterministic and does not imply design validation."],
        tables: [table("Parser Stages", ["Stage", "Status", "Confidence", "Message"], project.parserResult.stages.map((stage) => [stage.label, stage.status, stage.confidence, stage.message]))]
      }],
      findings: []
    },
    {
      id: "board",
      title: "Board Overview",
      summary: project.board.kicadPcb ? `${project.board.kicadPcb.summary.footprintCount} footprints, ${project.board.kicadPcb.summary.netCount} nets, ${project.board.kicadPcb.summary.viaCount} vias.` : "No parsed board layout is available.",
      subsections: [],
      findings: []
    },
    {
      id: "components",
      title: "Component Summary",
      summary: `${project.analysis.componentRoles.length} component role candidate(s) are available.`,
      subsections: [{
        title: "Component roles",
        body: ["Roles are deterministic heuristics from references, values, footprints, schematic metadata, and BOM metadata."],
        tables: [table("Roles", ["Reference", "Role", "Confidence"], project.analysis.componentRoles.slice(0, 80).map((role) => [role.reference, role.role, role.confidence]))]
      }],
      findings: []
    },
    {
      id: "nets",
      title: "Netlist and Net Classification Analysis",
      summary: `${project.netInventory.summary.totalNets} net(s), ${project.netInventory.summary.classifiedNets} classified by name-based rules.`,
      subsections: [{
        title: "Net classification table",
        body: ["Net classification is name-based and not electrical validation."],
        tables: [table("Nets", ["Name", "Classification", "Confidence"], project.netInventory.nets.slice(0, 120).map((net) => [net.name, net.classification, net.classificationConfidence]))]
      }],
      findings: []
    },
    {
      id: "bom",
      title: "BOM Summary",
      summary: project.bom.bom && !project.bom.bom.unsupported ? `${project.bom.bom.summary.rowCount} BOM row(s) parsed.` : "No supported BOM table is available.",
      subsections: [],
      findings: []
    },
    {
      id: "placement",
      title: "Placement Summary",
      summary: `${project.analysis.placement.components.length} placement component(s), ${project.analysis.placement.findings.length} placement finding(s).`,
      subsections: [],
      findings: []
    },
    {
      id: "power",
      title: "Power Tree and Power Budget Summary",
      summary: `${project.analysis.powerTree.rails.length} rail(s), ${project.analysis.powerTree.budgets.length} budget row(s). Current is unknown unless explicitly parsed.`,
      subsections: [{
        title: "Power rails",
        body: ["Power tree analysis does not verify regulator sizing, thermal margin, or datasheet correctness."],
        tables: [table("Rails", ["Rail", "Type", "Loads", "Sources"], project.analysis.powerTree.rails.map((rail) => [rail.name, rail.railType, `${rail.loadCandidates.length}`, rail.sourceCandidates.join(", ")]))]
      }],
      findings: []
    },
    {
      id: "decoupling",
      title: "Decoupling Capacitor Analysis",
      summary: `${project.analysis.decoupling.candidates.length} decoupling capacitor candidate(s), ${project.analysis.decoupling.findings.length} finding(s).`,
      subsections: [],
      findings: []
    },
    {
      id: "bias",
      title: "Pull-Up/Pull-Down and Bias Analysis",
      summary: `${project.analysis.pullResistors.candidates.length} pull resistor candidate(s), ${project.analysis.pullResistors.findings.length} finding(s).`,
      subsections: [],
      findings: []
    },
    {
      id: "firmware",
      title: "Firmware Manual Summary",
      summary: firmware ? `${firmware.summary.mcuCandidates} MCU candidate(s), ${firmware.summary.pinMapEntries} pin map entrie(s), readiness ${firmware.summary.readiness}.` : "Firmware manual unavailable.",
      subsections: [{
        title: "Firmware checklist preview",
        body: ["Firmware Mode is guidance only and requires datasheet review."],
        tables: [table("Checklist", ["Section", "Items"], (firmware?.checklist ?? []).map((item) => [item.section, item.items.join(" ")]))]
      }],
      findings: []
    },
    {
      id: "limitations",
      title: "Limitations and Required Next Files",
      summary: "The report separates parsed facts, heuristics, assumptions, missing data, and limitations.",
      subsections: [],
      findings: []
    }
  ];
}
