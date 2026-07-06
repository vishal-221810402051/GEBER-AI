import type { ProjectAssumption, ProjectEvidence } from "../../domain";
import type { ProjectModelInput } from "./projectModelTypes";

export function buildProjectEvidence(input: ProjectModelInput): {
  directEvidence: readonly ProjectEvidence[];
  inferredEvidence: readonly ProjectEvidence[];
  assumptions: readonly ProjectAssumption[];
} {
  const directEvidence = input.files
    .filter((file) => file.confidence === "direct")
    .map((file): ProjectEvidence => ({
      id: `direct-${file.id}`,
      kind: "direct-metadata",
      confidence: file.confidence,
      title: `${file.name} classified as ${file.categoryLabel}`,
      message: `File ${file.name} was classified from metadata only. Size ${file.sizeBytes} bytes, extension ${file.extension}.`,
      sourceFileIds: [file.id]
    }));

  const inferredEvidence = input.files
    .filter((file) => file.confidence !== "direct")
    .map((file): ProjectEvidence => ({
      id: `inferred-${file.id}`,
      kind: file.confidence === "missing-data" ? "missing-data" : "inferred-metadata",
      confidence: file.confidence,
      title: `${file.name} has ${file.categoryLabel} classification`,
      message: file.note,
      sourceFileIds: [file.id]
    }));

  const assumptions: ProjectAssumption[] = [
    {
      id: "metadata-only-model",
      confidence: "direct",
      title: "Project model is metadata-only",
      message:
        "The normalized project preview is built from file names, extensions, sizes, MIME metadata, selected mode, and completeness score.",
      affectedFuturePhases: ["Phase 4", "Future parser phases"]
    },
    {
      id: `selected-mode-${input.mode}`,
      confidence: "direct",
      title: `Selected mode is ${input.mode}`,
      message:
        "The selected mode affects missing-data warnings only. It does not start analysis.",
      affectedFuturePhases: ["Future analysis phases", "Future firmware phases"]
    }
  ];

  return { directEvidence, inferredEvidence, assumptions };
}
