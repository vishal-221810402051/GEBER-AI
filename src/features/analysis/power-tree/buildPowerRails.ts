import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { PowerInputCandidate, PowerRail, VoltageRegulatorCandidate } from "../../../domain/power";
import type { KiCadPcbParseResult } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { NormalizedNetInventory } from "../../../domain/nets";
import type { DecouplingAnalysisResult } from "../../../domain/analysis";
import { evidence } from "../shared/analysisEvidence";

function railType(name: string): PowerRail["railType"] {
  const upper = name.toUpperCase();
  if (upper.includes("VBUS") || upper.includes("USB")) return "usb-vbus";
  if (upper.includes("VBAT") || upper.includes("BAT")) return "battery";
  if (upper.includes("VIN")) return "input";
  if (upper.includes("VCORE")) return "mcu-core";
  if (upper.includes("AVDD") || upper.includes("VDDA")) return "analog";
  if (upper.includes("VREF")) return "reference";
  if (/^\+?(?:1V8|1\.8V|3V3|3\.3V|5V)$/.test(upper)) return "regulated";
  return "unknown";
}

export function buildPowerRails(input: {
  pcb?: KiCadPcbParseResult;
  inventory: NormalizedNetInventory;
  roles: readonly ComponentRoleCandidate[];
  decoupling: DecouplingAnalysisResult;
  regulators: readonly VoltageRegulatorCandidate[];
  inputs: readonly PowerInputCandidate[];
}): readonly PowerRail[] {
  const netIdByName = new Map(input.pcb?.nets.map((net) => [net.name, net.id]) ?? []);
  return input.inventory.nets
    .filter((net) => net.classification === "Power")
    .map((net) => {
      const footprints = input.pcb?.footprints.filter((footprint) => footprint.padNetNames.includes(net.name)) ?? [];
      const netId = netIdByName.get(net.name);
      const relatedRegulators = input.regulators.filter((regulator) => regulator.connectedPowerNets.includes(net.name)).map((regulator) => regulator.reference);
      const relatedConnectors = input.inputs.filter((candidate) => candidate.netName === net.name && candidate.reference).map((candidate) => candidate.reference!) ;
      const loads = footprints
        .filter((footprint) => !relatedRegulators.includes(footprint.reference ?? "") && !relatedConnectors.includes(footprint.reference ?? ""))
        .map((footprint) => ({
          reference: footprint.reference ?? "unknown",
          role: input.roles.find((role) => role.reference.toUpperCase() === footprint.reference?.toUpperCase())?.role ?? "unknown",
          confidence: "inferred-medium" as const,
          evidence: [evidence("pcb-layout", `${footprint.reference ?? "Component"} connects to rail ${net.name}.`, "direct")]
        }));

      return {
        name: net.name,
        railType: railType(net.name),
        sourceCandidates: [...relatedRegulators, ...relatedConnectors],
        loadCandidates: loads,
        connectedComponents: footprints.map((footprint) => footprint.reference ?? "unknown"),
        connectedPads: net.connectedPcbPads.length,
        viaCount: input.pcb?.vias.filter((via) => via.netId === netId).length ?? net.pcbViaCount,
        segmentCount: input.pcb?.trackSegments.filter((segment) => segment.netId === netId).length ?? net.pcbSegmentCount,
        zonePresent: (input.pcb?.zones.some((zone) => zone.netName === net.name || zone.netId === netId) ?? false) || net.pcbZoneCount > 0,
        relatedDecouplingCapacitors: input.decoupling.candidates.filter((candidate) => candidate.connectedPowerNet === net.name).map((candidate) => candidate.reference),
        relatedRegulatorCandidates: relatedRegulators,
        relatedConnectorCandidates: relatedConnectors,
        confidence: "inferred-high",
        evidence: [evidence("net-inventory", `Power rail ${net.name} detected by Phase 7 net classification.`, net.classificationConfidence)],
        limitations: ["Rail model is name/connectivity based; source direction, sequencing, and regulator sizing are not validated."]
      };
    });
}
