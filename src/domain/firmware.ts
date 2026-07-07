import type { AnalysisConfidence, AnalysisEvidence, AnalysisIssue } from "./analysis";
import type { NetClassification } from "./nets";

export type FirmwareConfidence = AnalysisConfidence;
export type FirmwareEvidence = AnalysisEvidence;
export type FirmwareFinding = AnalysisIssue;

export type FirmwareMcuCandidate = Readonly<{
  reference: string;
  candidateType: "mcu" | "programmable-ic" | "soc-module" | "fpga-cpld" | "unknown-programmable";
  value?: string;
  libraryId?: string;
  footprint?: string;
  bomDescription?: string;
  sourceFiles: readonly string[];
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwarePinMapEntry = Readonly<{
  mcuReference: string;
  physicalPin: string;
  symbolPinName: string;
  portPinName?: string;
  netName?: string;
  connectedComponentReferences: readonly string[];
  connectedConnectorPins: readonly string[];
  peripheralClassification: NetClassification;
  direction: "input" | "output" | "bidirectional" | "power" | "ground" | "unknown";
  voltageDomain?: string;
  pullEvidence: readonly string[];
  safetyConcern?: string;
  initializationNote: string;
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwareBus =
  | "UART"
  | "I2C"
  | "SPI"
  | "USB"
  | "CAN"
  | "PWM"
  | "ADC"
  | "GPIO"
  | "Reset"
  | "Boot/strap"
  | "Enable"
  | "Fault/interrupt"
  | "Programming/debug"
  | "Clock/crystal"
  | "External memory"
  | "RTC"
  | "Display"
  | "Motor control"
  | "Sensor input"
  | "Unknown";

export type FirmwarePeripheral = Readonly<{
  peripheralType: FirmwareBus;
  busName: string;
  nets: readonly string[];
  mcuPins: readonly string[];
  connectedDevices: readonly string[];
  pullEvidence: readonly string[];
  configurationNotes: readonly string[];
  initializationNotes: readonly string[];
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwareConnectorPin = Readonly<{
  pinNumber: string;
  netName?: string;
  netClassification: NetClassification;
  connectedMcuPin?: string;
  direction: FirmwarePinMapEntry["direction"];
  voltageWarning?: string;
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwareConnectorMap = Readonly<{
  reference: string;
  value?: string;
  footprint?: string;
  side: "top" | "bottom" | "unknown";
  x?: number;
  y?: number;
  pins: readonly FirmwareConnectorPin[];
  confidence: FirmwareConfidence;
  evidence: readonly FirmwareEvidence[];
  limitations: readonly string[];
}>;

export type FirmwareInitializationChecklist = Readonly<{
  section: string;
  items: readonly string[];
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwareDriverSuggestion = Readonly<{
  moduleName: string;
  whySuggested: string;
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitation: string;
}>;

export type FirmwareSafetyNote = Readonly<{
  title: string;
  note: string;
  evidence: readonly FirmwareEvidence[];
  confidence: FirmwareConfidence;
  limitation: string;
}>;

export type FirmwareBringUpStep = Readonly<{
  order: number;
  title: string;
  description: string;
  confidence: FirmwareConfidence;
  limitations: readonly string[];
}>;

export type FirmwareManualSummary = Readonly<{
  readiness: "strong" | "partial" | "weak" | "not-usable";
  mcuCandidates: number;
  pinMapEntries: number;
  peripheralGroups: number;
  connectorPinouts: number;
  checklistItems: number;
  limitations: number;
}>;

export type FirmwareManual = Readonly<{
  available: boolean;
  phase: "Phase 10";
  summary: FirmwareManualSummary;
  mcuCandidates: readonly FirmwareMcuCandidate[];
  pinMap: readonly FirmwarePinMapEntry[];
  peripherals: readonly FirmwarePeripheral[];
  connectors: readonly FirmwareConnectorMap[];
  checklist: readonly FirmwareInitializationChecklist[];
  driverSuggestions: readonly FirmwareDriverSuggestion[];
  safetyNotes: readonly FirmwareSafetyNote[];
  bringUpSteps: readonly FirmwareBringUpStep[];
  findings: readonly FirmwareFinding[];
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}>;
