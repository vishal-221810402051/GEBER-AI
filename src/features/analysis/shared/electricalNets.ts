import type { AnalysisConfidence, ElectricalNetCandidate } from "../../../domain/analysis";
import type { NormalizedNetInventory } from "../../../domain/nets";
import { classifyNet } from "../../net-explorer/classifyNet";
import { evidence } from "./analysisEvidence";

const powerNames = /^(?:\+?3V3|3\.3V|\+?5V|VBUS|VIN|VCC|VDD|VDDA|AVDD|VBAT|VREF|VCORE|1V8|1\.8V)$/i;
const groundNames = /^(?:GND|GNDA|AGND|DGND|PGND|0V)$/i;

function netConfidence(name: string, phase7Class?: string): AnalysisConfidence {
  if (phase7Class === "Power" || phase7Class === "Ground") {
    return "inferred-high";
  }
  if (powerNames.test(name) || groundNames.test(name)) {
    return "inferred-high";
  }
  return "inferred-medium";
}

export function classifyElectricalNet(name: string, inventory?: NormalizedNetInventory): ElectricalNetCandidate {
  const inventoryNet = inventory?.nets.find((net) => net.name.toUpperCase() === name.toUpperCase());
  const phase7 = inventoryNet?.classification ?? classifyNet(name).classification;
  const classification =
    phase7 === "Power" || powerNames.test(name)
      ? "power"
      : phase7 === "Ground" || groundNames.test(name)
        ? "ground"
        : "signal";

  return {
    name,
    classification,
    confidence: netConfidence(name, phase7),
    normalizedClassification: phase7,
    evidence: [
      evidence(
        inventoryNet ? "net-inventory" : "heuristic",
        inventoryNet
          ? `Phase 7 classified ${name} as ${phase7}.`
          : `Net ${name} classified by Phase 8 name heuristic.`,
        netConfidence(name, phase7)
      )
    ]
  };
}

export function collectPowerGroundNets(inventory: NormalizedNetInventory): {
  powerNets: readonly ElectricalNetCandidate[];
  groundNets: readonly ElectricalNetCandidate[];
} {
  const candidates = inventory.nets.map((net) => classifyElectricalNet(net.name, inventory));
  return {
    powerNets: candidates.filter((net) => net.classification === "power"),
    groundNets: candidates.filter((net) => net.classification === "ground")
  };
}
