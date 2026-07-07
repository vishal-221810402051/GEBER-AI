import type { FirmwareManual, FirmwareManualSummary } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";

export function firmwareReadiness(project: NormalizedPCBProject): FirmwareManualSummary["readiness"] {
  const hasSchematic = Boolean(project.schematic.kicadSchematic);
  const hasPcb = Boolean(project.board.kicadPcb);
  const hasBom = Boolean(project.bom.bom && !project.bom.bom.unsupported);
  if (hasSchematic && hasPcb && hasBom) return "strong";
  if (hasSchematic || hasPcb) return "partial";
  if (project.bom.bom || project.placement.placement) return "weak";
  return "not-usable";
}

export function summarizeFirmwareManual(project: NormalizedPCBProject, manual: Omit<FirmwareManual, "summary">): FirmwareManualSummary {
  return {
    readiness: firmwareReadiness(project),
    mcuCandidates: manual.mcuCandidates.length,
    pinMapEntries: manual.pinMap.length,
    peripheralGroups: manual.peripherals.length,
    connectorPinouts: manual.connectors.length,
    checklistItems: manual.checklist.reduce((total, section) => total + section.items.length, 0),
    limitations: manual.limitations.length + manual.findings.length
  };
}
