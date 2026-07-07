import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { VoltageRegulatorCandidate } from "../../../domain/power";
import type { KiCadPcbParseResult } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { DecouplingAnalysisResult } from "../../../domain/analysis";
import { evidence } from "../shared/analysisEvidence";
import { classifyElectricalNet } from "../shared/electricalNets";

const regulatorPattern = /(?:LDO|REG|BUCK|BOOST|DC-DC|AMS1117|AP2112|MP1584|TPS|LM2596|MIC|XC62|ME6211)/i;

export function detectRegulators(input: {
  pcb?: KiCadPcbParseResult;
  roles: readonly ComponentRoleCandidate[];
  decoupling: DecouplingAnalysisResult;
  inventory: Parameters<typeof classifyElectricalNet>[1];
}): readonly VoltageRegulatorCandidate[] {
  return input.roles
    .filter((role) => role.role === "regulator-power-ic" || regulatorPattern.test(`${role.reference} ${role.value ?? ""} ${role.footprint ?? ""}`))
    .map((role) => {
      const footprint = input.pcb?.footprints.find((item) => item.reference?.toUpperCase() === role.reference.toUpperCase());
      const classified = Array.from(new Set(footprint?.padNetNames ?? [])).map((netName) => classifyElectricalNet(netName, input.inventory));
      const power = classified.filter((net) => net.classification === "power").map((net) => net.name);
      const ground = classified.filter((net) => net.classification === "ground").map((net) => net.name);
      const nearbyCaps = input.decoupling.candidates
        .filter((candidate) => candidate.connectedPowerNet && power.includes(candidate.connectedPowerNet))
        .map((candidate) => candidate.reference);

      return {
        reference: role.reference,
        value: role.value,
        footprint: role.footprint,
        connectedPowerNets: power,
        connectedGroundNets: ground,
        possibleInputRail: power.find((net) => /VIN|VBUS|VBAT|BAT/i.test(net)) ?? power[0],
        possibleOutputRail: power.find((net) => !/VIN|VBUS|VBAT|BAT/i.test(net)),
        nearbyCapacitors: nearbyCaps,
        confidence: power.length ? "inferred-medium" : "inferred-low",
        evidence: [
          ...role.evidence,
          ...(footprint ? [evidence("pcb-layout", `${role.reference} connects to ${power.length} likely power net(s).`, "direct")] : [])
        ],
        limitations: ["Regulator detection is based on role/name/connectivity only; pinout correctness and datasheet mapping are not validated."]
      };
    });
}
