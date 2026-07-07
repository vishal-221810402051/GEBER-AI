import type { AnalysisConfidence, AnalysisEvidence, AnalysisIssue } from "./analysis";

export type PowerRailType =
  | "input"
  | "regulated"
  | "usb-vbus"
  | "battery"
  | "mcu-core"
  | "analog"
  | "reference"
  | "unknown";

export type PowerTreeNode = Readonly<{
  id: string;
  label: string;
  kind: "input" | "protection" | "regulator" | "rail" | "load" | "ground";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
}>;

export type PowerInputCandidate = Readonly<{
  reference?: string;
  netName: string;
  inputType: "usb-vbus" | "vin" | "battery" | "connector" | "unknown";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type PowerProtectionCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  connectedNets: readonly string[];
  protectionType: "fuse" | "tvs-esd" | "diode" | "unknown-protection";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type VoltageRegulatorCandidate = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  connectedPowerNets: readonly string[];
  connectedGroundNets: readonly string[];
  possibleInputRail?: string;
  possibleOutputRail?: string;
  nearbyCapacitors: readonly string[];
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type PowerRailLoad = Readonly<{
  reference: string;
  role: string;
  explicitCurrent?: string;
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
}>;

export type PowerBudgetEstimate = Readonly<{
  railName: string;
  knownLoadCount: number;
  unknownLoadCount: number;
  explicitCurrentValues: readonly string[];
  estimatedCurrent: "unknown" | string;
  confidence: AnalysisConfidence;
  limitations: readonly string[];
}>;

export type PowerRail = Readonly<{
  name: string;
  railType: PowerRailType;
  sourceCandidates: readonly string[];
  loadCandidates: readonly PowerRailLoad[];
  connectedComponents: readonly string[];
  connectedPads: number;
  viaCount: number;
  segmentCount: number;
  zonePresent: boolean;
  relatedDecouplingCapacitors: readonly string[];
  relatedRegulatorCandidates: readonly string[];
  relatedConnectorCandidates: readonly string[];
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type PowerPath = Readonly<{
  from: string;
  to: string;
  via: readonly string[];
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
}>;

export type PowerTreeFinding = AnalysisIssue;

export type PowerTreeAnalysisResult = Readonly<{
  available: boolean;
  inputs: readonly PowerInputCandidate[];
  protection: readonly PowerProtectionCandidate[];
  regulators: readonly VoltageRegulatorCandidate[];
  rails: readonly PowerRail[];
  budgets: readonly PowerBudgetEstimate[];
  paths: readonly PowerPath[];
  nodes: readonly PowerTreeNode[];
  findings: readonly PowerTreeFinding[];
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}>;
