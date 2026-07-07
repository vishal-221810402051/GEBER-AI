import type { NetClassification } from "./nets";

export type AnalysisSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational";

export type AnalysisConfidence =
  | "direct"
  | "inferred-high"
  | "inferred-medium"
  | "inferred-low"
  | "missing-data";

export type AnalysisEvidence = Readonly<{
  source: "pcb-layout" | "schematic" | "bom" | "placement" | "net-inventory" | "heuristic";
  detail: string;
  confidence: AnalysisConfidence;
}>;

export type AnalysisIssue = Readonly<{
  id: string;
  type:
    | "decoupling-evidence"
    | "decoupling-missing-evidence"
    | "decoupling-distance"
    | "pull-up-evidence"
    | "pull-down-evidence"
    | "bias-missing-evidence"
    | "analysis-limitation";
  title: string;
  severity: AnalysisSeverity;
  confidence: AnalysisConfidence;
  affectedComponent?: string;
  affectedNet?: string;
  relatedComponents: readonly string[];
  evidence: readonly AnalysisEvidence[];
  whyItMatters: string;
  recommendation: string;
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
  fullValidationComplete: false;
}>;

export type ComponentRole =
  | "ic"
  | "programmable-ic"
  | "active-device"
  | "capacitor"
  | "resistor"
  | "inductor-ferrite"
  | "crystal-oscillator"
  | "regulator-power-ic"
  | "connector"
  | "diode-protection"
  | "unknown";

export type ComponentRoleCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  role: ComponentRole;
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  ambiguous: boolean;
}>;

export type ElectricalNetCandidate = Readonly<{
  name: string;
  classification: "power" | "ground" | "signal";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  normalizedClassification?: NetClassification;
}>;

export type CapacitorDecouplingRole =
  | "local-decoupling-candidate"
  | "bulk-capacitor-candidate"
  | "regulator-input-output-candidate"
  | "unknown-capacitor";

export type DecouplingCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  connectedPowerNet?: string;
  connectedGroundNet?: string;
  x?: number;
  y?: number;
  role: CapacitorDecouplingRole;
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type IcPowerPinCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  x?: number;
  y?: number;
  powerPadCount: number;
  groundPadCount: number;
  powerNetNames: readonly string[];
  groundNetNames: readonly string[];
  decouplingStatus:
    | "likely-present"
    | "suspicious"
    | "missing-evidence"
    | "cannot-determine";
  nearestMatchingCapacitor?: string;
  nearestDistanceMm?: number;
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type DecouplingAnalysisResult = Readonly<{
  available: boolean;
  candidates: readonly DecouplingCandidate[];
  icPowerPins: readonly IcPowerPinCandidate[];
  findings: readonly AnalysisIssue[];
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}>;

export type PullResistorValueClass =
  | "strong-pull"
  | "typical-pull"
  | "weak-pull"
  | "suspicious-value"
  | "unknown-value";

export type PullResistorCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  signalNet: string;
  biasNet: string;
  biasType: "pull-up" | "pull-down";
  valueClass: PullResistorValueClass;
  relatedSignalClass: NetClassification;
  x?: number;
  y?: number;
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type SignalBiasRequirement = Readonly<{
  netName: string;
  signalClass: NetClassification;
  status: "bias-evidence-found" | "missing-bias-evidence" | "not-required" | "informational";
  expectedBias?: "pull-up" | "pull-down" | "either";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type PullNetworkFinding = AnalysisIssue;

export type PullResistorAnalysisResult = Readonly<{
  available: boolean;
  candidates: readonly PullResistorCandidate[];
  requirements: readonly SignalBiasRequirement[];
  findings: readonly PullNetworkFinding[];
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}>;

export type BoardAnalysisSummary = Readonly<{
  componentRoles: readonly ComponentRoleCandidate[];
  icCountReviewed: number;
  decouplingEvidenceFound: number;
  decouplingMissingEvidence: number;
  pullUpCandidates: number;
  pullDownCandidates: number;
  biasWarnings: number;
  confidenceLimitations: number;
}>;

export type BoardAnalysis = Readonly<{
  phase: "Phase 8";
  scope: "heuristic-decoupling-and-bias-analysis";
  fullValidationComplete: false;
  componentRoles: readonly ComponentRoleCandidate[];
  powerNets: readonly ElectricalNetCandidate[];
  groundNets: readonly ElectricalNetCandidate[];
  decoupling: DecouplingAnalysisResult;
  pullResistors: PullResistorAnalysisResult;
  summary: BoardAnalysisSummary;
  limitations: readonly string[];
}>;
