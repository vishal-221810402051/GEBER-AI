import { PROJECT_MODE_DEFINITIONS, type ProjectInputPackage, type ProjectMode } from "../../domain/workflow";

export type WorkflowReadiness = Readonly<{
  mode: ProjectMode;
  ready: boolean;
  missingInputs: readonly string[];
  warnings: readonly string[];
  actionLabel: string;
}>;

export function deriveWorkflowReadiness(
  mode: ProjectMode,
  input: ProjectInputPackage
): WorkflowReadiness {
  const missingInputs = [
    input.schematicFiles.length === 0 ? "schematic files" : undefined,
    input.gerberFiles.length === 0 ? "Gerber/package files" : undefined
  ].filter(Boolean) as string[];

  const warnings = mode === "inspect"
    ? [
        "Gerber files are currently detected/classified only.",
        "Gerber geometry is not parsed yet.",
        "Manufacturing and placement validation are unavailable."
      ]
    : [
        "Schematic is the primary logical source.",
        "Gerber evidence is currently classification-only.",
        "Pin correctness cannot be guaranteed.",
        "Datasheet review remains required."
      ];

  return {
    mode,
    ready: missingInputs.length === 0,
    missingInputs,
    warnings,
    actionLabel: PROJECT_MODE_DEFINITIONS[mode].actionLabel
  };
}
