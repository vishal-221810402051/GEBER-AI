import type { ClassificationConfidence } from "../features/intake/intakeTypes";

export type MissingDataSeverity = "critical" | "high" | "medium" | "low" | "info";

export type MissingDataWarning = Readonly<{
  id: string;
  title: string;
  severity: MissingDataSeverity;
  confidence: ClassificationConfidence;
  message: string;
  whyItMatters: string;
  requiredFiles: readonly string[];
  affectedFuturePhases: readonly string[];
}>;
