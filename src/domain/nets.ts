import type { ClassificationConfidence } from "../features/intake/intakeTypes";
import type { MissingDataSeverity } from "./warnings";

export type NormalizedNetSource =
  | "pcb-layout"
  | "schematic-label"
  | "schematic-global-label"
  | "schematic-hierarchical-label"
  | "inferred-from-name"
  | "unknown";

export type NetClassification =
  | "Power"
  | "Ground"
  | "Clock"
  | "Reset"
  | "UART"
  | "I2C"
  | "SPI"
  | "USB"
  | "CAN"
  | "PWM"
  | "ADC"
  | "GPIO"
  | "Motor control"
  | "Sensor input"
  | "Programming/debug"
  | "Differential pair"
  | "Boot/strap"
  | "Enable"
  | "Fault/interrupt"
  | "Analog"
  | "Unknown";

export type NormalizedNetDiagnostic = Readonly<{
  id: string;
  severity: MissingDataSeverity;
  message: string;
  confidence: ClassificationConfidence;
}>;

export type NormalizedNet = Readonly<{
  id: string;
  name: string;
  sources: readonly NormalizedNetSource[];
  classification: NetClassification;
  classificationConfidence: ClassificationConfidence;
  classificationEvidence: string;
  classificationReason: string;
  classificationIsInferred: boolean;
  evidence: readonly string[];
  connectedPcbFootprints: readonly string[];
  connectedPcbPads: readonly string[];
  pcbSegmentCount: number;
  pcbViaCount: number;
  pcbZoneCount: number;
  schematicLabelCount: number;
  schematicWirePrimitiveCount: number;
  relatedSchematicLabels: readonly string[];
  relatedPcbNetDeclaration?: string;
  diagnostics: readonly NormalizedNetDiagnostic[];
  limitations: readonly string[];
}>;

export type NetInventorySummary = Readonly<{
  totalNets: number;
  classifiedNets: number;
  unknownNets: number;
  powerNets: number;
  groundNets: number;
  communicationNets: number;
  diagnosticsCount: number;
  classificationDistribution: Readonly<Record<string, number>>;
  sourceDistribution: Readonly<Record<string, number>>;
}>;

export type NormalizedNetInventory = Readonly<{
  available: boolean;
  nets: readonly NormalizedNet[];
  summary: NetInventorySummary;
  diagnostics: readonly NormalizedNetDiagnostic[];
  limitations: readonly string[];
}>;
