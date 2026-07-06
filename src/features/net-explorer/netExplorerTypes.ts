import type { NetClassification, NormalizedNetSource } from "../../domain";
import type { ClassificationConfidence } from "../intake/intakeTypes";

export type NetClassificationResult = Readonly<{
  classification: NetClassification;
  confidence: ClassificationConfidence;
  evidence: string;
  reason: string;
  inferred: boolean;
}>;

export type NetSourceAccumulator = {
  name: string;
  sources: Set<NormalizedNetSource>;
  evidence: string[];
  connectedPcbFootprints: Set<string>;
  connectedPcbPads: Set<string>;
  pcbSegmentCount: number;
  pcbViaCount: number;
  pcbZoneCount: number;
  schematicLabelCount: number;
  schematicWirePrimitiveCount: number;
  relatedSchematicLabels: Set<string>;
  relatedPcbNetDeclaration?: string;
};
