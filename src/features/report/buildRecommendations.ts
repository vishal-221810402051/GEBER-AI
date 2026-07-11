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
      id: "rec-gerber-parser-gap",
      priority: "high",
      category: "source-files",
      title: "Treat board geometry and physical correlation as unavailable",
      evidenceBasis: "Gerber geometry parsing is not implemented in the canonical workflow.",
      requiredAction: "Use Gerber/package files as detected evidence only until the Gerber parser phases are implemented.",
      expectedConfidenceImprovement: "Future parsed Gerber geometry can improve board, net, placement, decoupling, power, and connector evidence."
    });
  }
  if (!project.bom.bom || project.bom.bom.unsupported) {
    add({
      id: "rec-generated-bom-deferred",
      priority: "medium",
      category: "bom",
      title: "Generated BOM is deferred",
      evidenceBasis: "Uploaded BOM files are not part of the canonical input workflow.",
      requiredAction: "Use schematic symbol properties when schematic-derived BOM generation is implemented; unknown MPN/current fields must stay unknown.",
      expectedConfidenceImprovement: "Future generated BOM evidence can improve component identification and power budget confidence without relying on uploaded BOM files."
    });
  }
  if (!project.placement.placement) {
    add({
      id: "rec-placement-correlation-unavailable",
      priority: "medium",
      category: "placement",
      title: "Exact placement correlation is unavailable",
      evidenceBasis: "Pick-and-place files are not part of the canonical input workflow and Gerber attributes are not parsed yet.",
      requiredAction: "Treat placement findings as unavailable unless future Gerber attributes support them.",
      expectedConfidenceImprovement: "Future parsed Gerber attributes can improve placement confidence where evidence supports it."
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
      requiredAction: "Check schematic evidence, future physical correlation data, and IC datasheets.",
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
