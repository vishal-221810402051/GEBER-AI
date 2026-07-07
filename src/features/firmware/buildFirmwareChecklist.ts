import type { FirmwareInitializationChecklist, FirmwarePeripheral } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import { evidence } from "../analysis/shared/analysisEvidence";

export function buildFirmwareChecklist(project: NormalizedPCBProject, peripherals: readonly FirmwarePeripheral[]): readonly FirmwareInitializationChecklist[] {
  return [
    {
      section: "Power and clock pre-checks",
      items: [
        "Verify voltage domains before enabling peripherals.",
        "Confirm clocks/crystals and reset behavior before high-speed interfaces."
      ],
      evidence: [evidence("net-inventory", `${project.analysis.powerTree.rails.length} power rail(s) detected for firmware bring-up context.`, "inferred-medium")],
      confidence: project.analysis.powerTree.rails.length ? "inferred-medium" : "missing-data",
      limitations: ["Power tree evidence does not validate regulator sizing or thermal margin."]
    },
    {
      section: "Boot and reset configuration",
      items: [
        "Check reset and boot/strap nets before programming.",
        "Avoid unsafe boot states during initial GPIO configuration."
      ],
      evidence: [evidence("net-inventory", "Reset/boot checks are generated from net classifications when available.", "inferred-medium")],
      confidence: "inferred-medium",
      limitations: ["Boot behavior is MCU-specific and requires datasheet review."]
    },
    {
      section: "Communication buses",
      items: peripherals.map((peripheral) => `Bring up ${peripheral.peripheralType} on nets ${peripheral.nets.join(", ") || "unknown nets"} after pin mux review.`),
      evidence: [evidence("heuristic", `${peripherals.length} firmware peripheral group(s) detected.`, "inferred-medium")],
      confidence: peripherals.length ? "inferred-medium" : "missing-data",
      limitations: ["Peripheral configuration is not claimed correct."]
    },
    {
      section: "Safety and fault handling",
      items: [
        "Configure fault/interrupt inputs with safe defaults where detected.",
        "Do not enable high-current loads until hardware validation is complete."
      ],
      evidence: [evidence("heuristic", "Safety checklist is generated from parsed firmware and power evidence.", "inferred-low")],
      confidence: "inferred-low",
      limitations: ["No safety compliance claim is made."]
    }
  ];
}
