import type { BoardAnalysis } from "../../domain/analysis";
import type { NormalizedPCBProject } from "../../domain/project";
import { buildDecouplingAnalysis } from "./decoupling/buildDecouplingAnalysis";
import { buildPullResistorAnalysis } from "./pull-resistors/buildPullResistorAnalysis";
import { buildAnalysisSummary } from "./analysisSummary";
import { buildPlacementAnalysis } from "./placement/buildPlacementAnalysis";
import { buildPowerTreeAnalysis } from "./power-tree/buildPowerTreeAnalysis";
import { buildComponentRoles } from "./shared/componentRoles";
import { collectPowerGroundNets } from "./shared/electricalNets";

export function buildBoardAnalysis(project: Omit<NormalizedPCBProject, "analysis" | "firmware" | "report">): BoardAnalysis {
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
  const placement = buildPlacementAnalysis({
    pcb: board,
    placement: project.placement.placement,
    roles: componentRoles,
    decoupling
  });
  const powerTree = buildPowerTreeAnalysis({
    pcb: board,
    bom: project.bom.bom,
    inventory: project.netInventory,
    roles: componentRoles,
    powerNetNames: powerNets.map((net) => net.name),
    decoupling
  });

  return {
    phase: "Phase 9",
    scope: "heuristic-placement-and-power-tree-analysis",
    fullValidationComplete: false,
    componentRoles,
    powerNets,
    groundNets,
    decoupling,
    pullResistors,
    placement,
    powerTree,
    summary: buildAnalysisSummary({ componentRoles, decoupling, pullResistors, placement, powerTree }),
    limitations: [
      "Phase 9 analysis is heuristic and evidence-based. It is not full manufacturing validation or full electrical validation.",
      "Power tree analysis does not verify regulator sizing, thermal margin, or datasheet correctness.",
      "No Firmware Mode, MCU firmware pin mapping, report generation, or export workflow is implemented."
    ]
  };
}
