import type { FirmwareManual, NormalizedPCBProject } from "../../domain";
import type { EngineeringReport } from "../../domain/report";
import type { ProjectInputPackage, ProjectMode } from "../../domain/workflow";

export type ProjectWorkflowInput = Readonly<{
  mode: ProjectMode;
  inputPackage: ProjectInputPackage;
  normalizedProject: NormalizedPCBProject | null;
}>;

export type BlockedWorkflowResult = Readonly<{
  mode: ProjectMode;
  status: "blocked";
  reasons: readonly string[];
  missingInputs: readonly string[];
}>;

export type InspectWorkflowResult = Readonly<{
  mode: "inspect";
  status: "ready";
  outputKind: "engineering-report";
  project: NormalizedPCBProject;
  output: EngineeringReport;
  generatedBomStatus: "deferred";
  warnings: readonly string[];
  limitations: readonly string[];
}>;

export type FirmwareWorkflowResult = Readonly<{
  mode: "firmware";
  status: "ready";
  outputKind: "firmware-manual";
  project: NormalizedPCBProject;
  output: FirmwareManual;
  warnings: readonly string[];
  limitations: readonly string[];
}>;

export type ProjectWorkflowResult =
  | BlockedWorkflowResult
  | InspectWorkflowResult
  | FirmwareWorkflowResult;
