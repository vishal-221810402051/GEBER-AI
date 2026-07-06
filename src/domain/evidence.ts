import type { ClassificationConfidence } from "../features/intake/intakeTypes";

export type ProjectEvidenceKind =
  | "direct-metadata"
  | "inferred-metadata"
  | "assumption"
  | "missing-data";

export type ProjectEvidence = Readonly<{
  id: string;
  kind: ProjectEvidenceKind;
  confidence: ClassificationConfidence;
  title: string;
  message: string;
  sourceFileIds: readonly string[];
}>;

export type ProjectAssumption = Readonly<{
  id: string;
  confidence: ClassificationConfidence;
  title: string;
  message: string;
  affectedFuturePhases: readonly string[];
}>;
