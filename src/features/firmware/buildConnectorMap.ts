import type { FirmwareConnectorMap, FirmwarePinMapEntry } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import { evidence } from "../analysis/shared/analysisEvidence";

function sideFromLayer(layer?: string): "top" | "bottom" | "unknown" {
  if (!layer) return "unknown";
  if (layer.toLowerCase().startsWith("f.")) return "top";
  if (layer.toLowerCase().startsWith("b.")) return "bottom";
  return "unknown";
}

export function buildConnectorMap(project: NormalizedPCBProject, pinMap: readonly FirmwarePinMapEntry[]): readonly FirmwareConnectorMap[] {
  return (project.board.kicadPcb?.footprints ?? [])
    .filter((footprint) => {
      const role = project.analysis.componentRoles.find((item) => item.reference.toUpperCase() === footprint.reference?.toUpperCase());
      return role?.role === "connector" || /^(?:J|P|CN|CON)/i.test(footprint.reference ?? "");
    })
    .map((footprint) => ({
      reference: footprint.reference ?? "unknown-connector",
      value: footprint.value,
      footprint: footprint.footprintName,
      side: sideFromLayer(footprint.layer),
      x: footprint.x,
      y: footprint.y,
      pins: footprint.pads.map((pad) => {
        const net = pad.netName ? project.netInventory.nets.find((item) => item.name.toUpperCase() === pad.netName?.toUpperCase()) : undefined;
        const connected = pinMap.find((entry) => entry.netName && entry.netName === pad.netName);
        const direction = net?.classification === "Power" ? "power" : net?.classification === "Ground" ? "ground" : connected?.direction ?? "unknown";
        return {
          pinNumber: pad.number || "Unknown physical pin",
          netName: pad.netName,
          netClassification: net?.classification ?? "Unknown",
          connectedMcuPin: connected ? `${connected.mcuReference}:${connected.physicalPin}` : undefined,
          direction,
          voltageWarning: net?.classification === "Power" ? "Connector pin exposes a power net; avoid accidental shorts during bring-up." : undefined,
          evidence: [evidence("pcb-layout", `Connector pinout inferred from legacy physical pad evidence for ${footprint.reference ?? "connector"} pad ${pad.number}.`, pad.netName ? "direct" : "missing-data")],
          confidence: pad.netName ? "inferred-medium" as const : "missing-data" as const,
          limitations: ["Requires schematic and datasheet review before firmware use."]
        };
      }),
      confidence: footprint.pads.some((pad) => pad.netName) ? "inferred-medium" : "missing-data",
      evidence: [evidence("pcb-layout", `${footprint.reference ?? "Connector"} detected as connector candidate from footprint/reference.`, "inferred-medium")],
      limitations: ["Connector map is inferred from legacy physical pad evidence and is not a validated external pinout."]
    }));
}
