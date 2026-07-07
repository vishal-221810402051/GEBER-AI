import type { FirmwareSafetyNote } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import { evidence } from "../analysis/shared/analysisEvidence";

export function buildFirmwareSafetyNotes(project: NormalizedPCBProject): readonly FirmwareSafetyNote[] {
  const notes: FirmwareSafetyNote[] = [];
  if (project.netInventory.nets.some((net) => net.classification === "Boot/strap")) {
    notes.push({
      title: "Boot/strap nets found",
      note: "Firmware and hardware bring-up must avoid unsafe boot states.",
      evidence: [evidence("net-inventory", "Boot/strap net classification found.", "inferred-medium")],
      confidence: "inferred-medium",
      limitation: "Boot behavior is device-specific and requires datasheet review."
    });
  }
  if (project.netInventory.nets.some((net) => net.classification === "Reset")) {
    notes.push({
      title: "Reset net found",
      note: "Verify reset line state during programming and initial boot.",
      evidence: [evidence("net-inventory", "Reset net classification found.", "inferred-medium")],
      confidence: "inferred-medium",
      limitation: "Reset timing and electrical behavior are not validated."
    });
  }
  if (project.analysis.powerTree.budgets.some((budget) => budget.estimatedCurrent === "unknown")) {
    notes.push({
      title: "Unknown current budget",
      note: "Do not enable high-current loads before hardware validation.",
      evidence: [evidence("bom", "One or more rail currents are unknown.", "missing-data")],
      confidence: "missing-data",
      limitation: "No datasheet current database exists in Phase 10."
    });
  }
  project.analysis.pullResistors.findings
    .filter((finding) => finding.type === "bias-missing-evidence")
    .slice(0, 4)
    .forEach((finding) => notes.push({
      title: finding.title,
      note: "Firmware bring-up should treat missing bias evidence cautiously.",
      evidence: finding.evidence,
      confidence: finding.confidence,
      limitation: "Bias requirement is heuristic and not datasheet-validated."
    }));
  return notes;
}
