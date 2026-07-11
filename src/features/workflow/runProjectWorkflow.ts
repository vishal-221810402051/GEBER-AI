import { deriveWorkflowReadiness } from "./workflowReadiness";
import type {
  BlockedWorkflowResult,
  ProjectWorkflowInput,
  ProjectWorkflowResult
} from "./projectWorkflowTypes";

const inspectLimitations = [
  "Gerber geometry parsing is limited to supported RS-274X syntax.",
  "Schematic-to-Gerber correlation is not implemented.",
  "Generated BOM implementation is deferred.",
  "Manufacturing validation is unavailable.",
  "Production readiness is not established."
] as const;

const firmwareLimitations = [
  "Schematic is the primary logical source.",
  "Gerber geometry may be available, but firmware mapping remains schematic-first.",
  "Pin/net mappings may be incomplete.",
  "Datasheet verification is required.",
  "Firmware guidance is not proof of pin correctness."
] as const;

function blocked(
  input: ProjectWorkflowInput,
  reasons: readonly string[],
  missingInputs: readonly string[]
): BlockedWorkflowResult {
  return {
    mode: input.mode,
    status: "blocked",
    reasons,
    missingInputs
  };
}

export function runProjectWorkflow(input: ProjectWorkflowInput): ProjectWorkflowResult {
  const readiness = deriveWorkflowReadiness(input.mode, input.inputPackage);

  if (!readiness.ready) {
    return blocked(input, ["Required canonical project inputs are missing."], readiness.missingInputs);
  }

  if (!input.normalizedProject) {
    return blocked(input, ["Normalized project state is unavailable."], []);
  }

  if (input.mode === "inspect") {
    const report = input.normalizedProject.report.engineeringReport;

    if (!report?.available) {
      return blocked(input, ["Engineering report output is unavailable."], []);
    }

    return {
      mode: "inspect",
      status: "ready",
      outputKind: "engineering-report",
      project: input.normalizedProject,
      output: report,
      generatedBomStatus: "deferred",
      warnings: readiness.warnings,
      limitations: inspectLimitations
    };
  }

  const manual = input.normalizedProject.firmware.manual;

  if (!manual?.available) {
    return blocked(input, ["Firmware manual output is unavailable."], []);
  }

  return {
    mode: "firmware",
    status: "ready",
    outputKind: "firmware-manual",
    project: input.normalizedProject,
    output: manual,
    warnings: readiness.warnings,
    limitations: firmwareLimitations
  };
}
