import type { BoardAnalysis } from "../../domain/analysis";
import type { NormalizedPCBProject } from "../../domain/project";
import { buildDecouplingAnalysis } from "./decoupling/buildDecouplingAnalysis";
import { buildPullResistorAnalysis } from "./pull-resistors/buildPullResistorAnalysis";
import { buildAnalysisSummary } from "./analysisSummary";
import { buildComponentRoles } from "./shared/componentRoles";
import { collectPowerGroundNets } from "./shared/electricalNets";

export function buildBoardAnalysis(project: Omit<NormalizedPCBProject, "analysis">): BoardAnalysis {
  const board = project.board.kicadPcb;
  const schematic = project.schematic.kicadSchematic;
  const componentRoles = buildComponentRoles({
    footprints: board?.footprints,
    symbols: schematic?.symbols,
    bom: project.bom.bom
  });
  const { powerNets, groundNets } = collectPowerGroundNets(project.netInventory);
  const decoupling = buildDecouplingAnalysis({
    footprints: board?.footprints,
    roles: componentRoles,
    inventory: project.netInventory
  });
  const pullResistors = buildPullResistorAnalysis({
    footprints: board?.footprints,
    roles: componentRoles,
    inventory: project.netInventory
  });

  return {
    phase: "Phase 8",
    scope: "heuristic-decoupling-and-bias-analysis",
    fullValidationComplete: false,
    componentRoles,
    powerNets,
    groundNets,
    decoupling,
    pullResistors,
    summary: buildAnalysisSummary({ componentRoles, decoupling, pullResistors }),
    limitations: [
      "Phase 8 analysis is heuristic and evidence-based. It is not full electrical validation.",
      "Confidence depends on parsed pad-net data, schematic metadata, BOM values, and coordinates.",
      "No full power tree, regulator margin analysis, thermal analysis, firmware mapping, report generation, or export workflow is implemented."
    ]
  };
}
