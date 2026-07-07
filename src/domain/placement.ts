import type { AnalysisConfidence, AnalysisEvidence, AnalysisIssue, ComponentRole } from "./analysis";

export type PlacementRiskCategory =
  | "decoupling-proximity"
  | "regulator-capacitor-proximity"
  | "crystal-proximity"
  | "connector-edge-access"
  | "test-point-access"
  | "crowding"
  | "thermal-clustering"
  | "analog-digital-separation"
  | "high-current-placement"
  | "data-completeness";

export type ComponentPlacementRole = ComponentRole | "test-point" | "high-current-candidate";

export type NormalizedPlacementComponent = Readonly<{
  reference: string;
  role: ComponentPlacementRole;
  value?: string;
  footprint?: string;
  source: "pcb" | "pick-and-place" | "both";
  pcbX?: number;
  pcbY?: number;
  placementX?: number;
  placementY?: number;
  x?: number;
  y?: number;
  coordinateDelta?: number;
  rotation?: number;
  side: "top" | "bottom" | "unknown";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  missingFields: readonly string[];
  relatedNets: readonly string[];
}>;

export type ComponentProximityResult = Readonly<{
  sourceReference: string;
  targetReference: string;
  distanceMm?: number;
  category: PlacementRiskCategory;
  status: "local-evidence" | "moderate-evidence" | "suspicious" | "cannot-assess";
  confidence: AnalysisConfidence;
  evidence: readonly AnalysisEvidence[];
  limitations: readonly string[];
}>;

export type PlacementFinding = AnalysisIssue & Readonly<{
  placementCategory: PlacementRiskCategory;
}>;

export type ConnectorAccessFinding = PlacementFinding;
export type ThermalPlacementFinding = PlacementFinding;
export type CrystalPlacementFinding = PlacementFinding;
export type RegulatorPlacementFinding = PlacementFinding;
export type HighCurrentPathFinding = PlacementFinding;

export type PlacementAnalysisResult = Readonly<{
  available: boolean;
  components: readonly NormalizedPlacementComponent[];
  coordinateSourceSummary: Readonly<{
    pcbOnly: number;
    placementOnly: number;
    both: number;
    missingCoordinates: number;
  }>;
  proximity: readonly ComponentProximityResult[];
  findings: readonly PlacementFinding[];
  limitations: readonly string[];
  requiredFilesForStrongerValidation: readonly string[];
}>;
