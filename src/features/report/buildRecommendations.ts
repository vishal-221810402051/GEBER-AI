import type { EngineeringReportRecommendation } from "../../domain/report";
import type { NormalizedPCBProject } from "../../domain/project";

export function buildRecommendations(project: NormalizedPCBProject): readonly EngineeringReportRecommendation[] {
  const recommendations: EngineeringReportRecommendation[] = [];
  const add = (rec: EngineeringReportRecommendation) => recommendations.push(rec);

  if (!project.schematic.kicadSchematic) {
    add({
      id: "rec-upload-schematic",
      priority: "high",
      category: "source-files",
      title: "Upload `.kicad_sch` for schematic-aware analysis",
      evidenceBasis: "Schematic model is unavailable.",
      requiredAction: "Provide KiCad schematic file.",
      expectedConfidenceImprovement: "Improves component intent, firmware pin evidence, and schematic-level review confidence."
    });
  }
  if (!project.board.kicadPcb) {
    add({
      id: "rec-upload-pcb",
      priority: "high",
      category: "source-files",
      title: "Upload `.kicad_pcb` for board-level footprint, pad, and net analysis",
      evidenceBasis: "PCB layout model is unavailable.",
      requiredAction: "Provide KiCad PCB file.",
      expectedConfidenceImprovement: "Improves board, net, placement, decoupling, power, and firmware connector evidence."
    });
  }
  if (!project.bom.bom || project.bom.bom.unsupported) {
    add({
      id: "rec-upload-bom",
      priority: "medium",
      category: "bom",
      title: "Upload BOM with MPN and current fields",
      evidenceBasis: "BOM data is unavailable or unsupported.",
      requiredAction: "Provide CSV/TSV BOM with references, values, MPNs, and current ratings where known.",
      expectedConfidenceImprovement: "Improves component identification and power budget confidence."
    });
  }
  if (!project.placement.placement) {
    add({
      id: "rec-upload-placement",
      priority: "medium",
      category: "placement",
      title: "Upload pick-and-place file for assembly and placement confidence",
      evidenceBasis: "Placement table is unavailable.",
      requiredAction: "Provide centroid/pick-and-place file.",
      expectedConfidenceImprovement: "Improves placement source comparison and assembly review confidence."
    });
  }
  if (project.analysis.pullResistors.findings.some((finding) => finding.type === "bias-missing-evidence")) {
    add({
      id: "rec-review-bias",
      priority: "medium",
      category: "bias",
      title: "Review pull-up/pull-down evidence for flagged nets",
      evidenceBasis: "Phase 8 generated missing bias evidence findings.",
      requiredAction: "Review I2C, reset, boot, enable, interrupt, and fault nets in schematic and datasheets.",
      expectedConfidenceImprovement: "Improves firmware bring-up and signal idle-state confidence."
    });
  }
  if (project.analysis.decoupling.findings.some((finding) => finding.type === "decoupling-missing-evidence")) {
    add({
      id: "rec-review-decoupling",
      priority: "medium",
      category: "decoupling",
      title: "Review decoupling evidence for ICs with missing matching capacitors",
      evidenceBasis: "Phase 8 generated missing decoupling evidence findings.",
      requiredAction: "Check schematic, PCB placement, and IC datasheets.",
      expectedConfidenceImprovement: "Improves local power integrity review confidence, without proving correctness."
    });
  }
  if (project.analysis.powerTree.budgets.some((budget) => budget.estimatedCurrent === "unknown")) {
    add({
      id: "rec-power-budget",
      priority: "medium",
      category: "power",
      title: "Verify regulator datasheets and current margins manually",
      evidenceBasis: "One or more rail current estimates are unknown.",
      requiredAction: "Provide current data or review datasheets manually.",
      expectedConfidenceImprovement: "Improves power-tree and regulator margin confidence."
    });
  }
  if (project.firmware.manual?.available) {
    add({
      id: "rec-firmware-datasheet",
      priority: "medium",
      category: "firmware",
      title: "Verify firmware pin mapping against MCU datasheet before coding",
      evidenceBasis: "Firmware Mode generated guidance from parsed evidence.",
      requiredAction: "Review MCU datasheet, pin mux tables, boot strap rules, and connector pinout.",
      expectedConfidenceImprovement: "Improves firmware bring-up confidence; does not make firmware production-ready."
    });
  }

  return recommendations;
}
