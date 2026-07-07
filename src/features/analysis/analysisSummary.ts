import type { BoardAnalysisSummary, ComponentRoleCandidate, DecouplingAnalysisResult, PullResistorAnalysisResult } from "../../domain/analysis";

export function buildAnalysisSummary(input: {
  componentRoles: readonly ComponentRoleCandidate[];
  decoupling: DecouplingAnalysisResult;
  pullResistors: PullResistorAnalysisResult;
}): BoardAnalysisSummary {
  return {
    componentRoles: input.componentRoles,
    icCountReviewed: input.decoupling.icPowerPins.length,
    decouplingEvidenceFound: input.decoupling.icPowerPins.filter((ic) => ic.decouplingStatus === "likely-present").length,
    decouplingMissingEvidence: input.decoupling.icPowerPins.filter((ic) => ic.decouplingStatus === "missing-evidence").length,
    pullUpCandidates: input.pullResistors.candidates.filter((candidate) => candidate.biasType === "pull-up").length,
    pullDownCandidates: input.pullResistors.candidates.filter((candidate) => candidate.biasType === "pull-down").length,
    biasWarnings: input.pullResistors.findings.filter((finding) => finding.type === "bias-missing-evidence").length,
    confidenceLimitations: input.decoupling.limitations.length + input.pullResistors.limitations.length
  };
}
