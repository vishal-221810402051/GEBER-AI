import type { BoardAnalysisSummary, ComponentRoleCandidate, DecouplingAnalysisResult, PullResistorAnalysisResult } from "../../domain/analysis";
import type { PlacementAnalysisResult } from "../../domain/placement";
import type { PowerTreeAnalysisResult } from "../../domain/power";

export function buildAnalysisSummary(input: {
  componentRoles: readonly ComponentRoleCandidate[];
  decoupling: DecouplingAnalysisResult;
  pullResistors: PullResistorAnalysisResult;
  placement: PlacementAnalysisResult;
  powerTree: PowerTreeAnalysisResult;
}): BoardAnalysisSummary {
  return {
    componentRoles: input.componentRoles,
    icCountReviewed: input.decoupling.icPowerPins.length,
    decouplingEvidenceFound: input.decoupling.icPowerPins.filter((ic) => ic.decouplingStatus === "likely-present").length,
    decouplingMissingEvidence: input.decoupling.icPowerPins.filter((ic) => ic.decouplingStatus === "missing-evidence").length,
    pullUpCandidates: input.pullResistors.candidates.filter((candidate) => candidate.biasType === "pull-up").length,
    pullDownCandidates: input.pullResistors.candidates.filter((candidate) => candidate.biasType === "pull-down").length,
    biasWarnings: input.pullResistors.findings.filter((finding) => finding.type === "bias-missing-evidence").length,
    confidenceLimitations: input.decoupling.limitations.length + input.pullResistors.limitations.length + input.placement.limitations.length + input.powerTree.limitations.length,
    placementComponentsReviewed: input.placement.components.length,
    placementFindings: input.placement.findings.length,
    powerRailsDetected: input.powerTree.rails.length,
    regulatorCandidates: input.powerTree.regulators.length,
    powerInputCandidates: input.powerTree.inputs.length,
    powerFindings: input.powerTree.findings.length,
    unknownCurrentLoads: input.powerTree.budgets.reduce((total, budget) => total + budget.unknownLoadCount, 0)
  };
}
