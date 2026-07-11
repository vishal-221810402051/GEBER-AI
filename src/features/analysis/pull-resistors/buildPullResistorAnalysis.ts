import type {
  ComponentRoleCandidate,
  PullResistorAnalysisResult,
  PullResistorCandidate,
  SignalBiasRequirement
} from "../../../domain/analysis";
import type { NormalizedNet, NormalizedNetInventory } from "../../../domain/nets";
import type { KiCadPcbFootprint } from "../../parsers/kicad-pcb/kicadPcbTypes";
import { evidence, issue } from "../shared/analysisEvidence";
import { classifyElectricalNet } from "../shared/electricalNets";
import { classifyPullValue } from "../shared/valueParsing";

function roleFor(reference: string | undefined, roles: readonly ComponentRoleCandidate[]) {
  if (!reference) {
    return undefined;
  }
  return roles.find((role) => role.reference.toUpperCase() === reference.toUpperCase());
}

function requirementForNet(net: NormalizedNet): SignalBiasRequirement | undefined {
  const name = net.name.toUpperCase();
  if (net.classification === "I2C") {
    return {
      netName: net.name,
      signalClass: net.classification,
      status: "missing-bias-evidence",
      expectedBias: "pull-up",
      confidence: "inferred-medium",
      evidence: [evidence("net-inventory", `${net.name} is classified as I2C by Phase 7.`, net.classificationConfidence)],
      limitations: ["I2C pull-up need is name/classification based; no device datasheet validation is complete."]
    };
  }
  if (net.classification === "Reset" || net.classification === "Enable" || net.classification === "Boot/strap") {
    return {
      netName: net.name,
      signalClass: net.classification,
      status: "missing-bias-evidence",
      expectedBias: "either",
      confidence: "inferred-medium",
      evidence: [evidence("net-inventory", `${net.name} is classified as ${net.classification}.`, net.classificationConfidence)],
      limitations: ["Bias expectation is heuristic; datasheet requirements are not parsed."]
    };
  }
  if (net.classification === "Fault/interrupt" || /(?:INT|IRQ|FAULT|ALERT)/.test(name)) {
    return {
      netName: net.name,
      signalClass: net.classification,
      status: "missing-bias-evidence",
      expectedBias: "pull-up",
      confidence: "inferred-low",
      evidence: [evidence("net-inventory", `${net.name} may be open-drain style by name/classification.`, net.classificationConfidence)],
      limitations: ["Open-drain behavior cannot be confirmed without component datasheets."]
    };
  }
  if (net.classification === "SPI" && /(?:CS|SS|NSS)/.test(name)) {
    return {
      netName: net.name,
      signalClass: net.classification,
      status: "informational",
      expectedBias: "either",
      confidence: "inferred-low",
      evidence: [evidence("net-inventory", `${net.name} appears to be an SPI chip-select style net.`, net.classificationConfidence)],
      limitations: ["Chip-select bias depends on target devices and is not inferred as required."]
    };
  }
  return undefined;
}

export function buildPullResistorAnalysis(input: {
  footprints?: readonly KiCadPcbFootprint[];
  roles: readonly ComponentRoleCandidate[];
  inventory: NormalizedNetInventory;
}): PullResistorAnalysisResult {
  const footprints = input.footprints ?? [];
  const limitations = [
    "Phase 8 pull-up/pull-down analysis is heuristic and evidence-based; full electrical validation is not complete."
  ];

  if (footprints.length === 0) {
    return {
      available: false,
      candidates: [],
      requirements: [],
      findings: [
        issue({
          id: "pull-resistor-no-pad-net-data",
          type: "analysis-limitation",
          title: "Cannot determine pull resistors because pad-net data is unavailable",
          severity: "informational",
          confidence: "missing-data",
          evidence: [evidence("pcb-layout", "No parsed PCB footprints were available for resistor pad-net analysis.", "missing-data")],
          whyItMatters: "Pull-up and pull-down candidates require knowing which resistor pads connect to signal, power, and ground nets.",
          recommendation: "Treat pull-resistor physical confirmation as unavailable until future Gerber parsing supplies supported pad/net evidence.",
          limitations,
          requiredFilesForStrongerValidation: [".kicad_sch", "parsed Gerber geometry/attributes", "component datasheets"]
        })
      ],
      limitations,
      requiredFilesForStrongerValidation: [".kicad_sch", "parsed Gerber geometry/attributes", "component datasheets"]
    };
  }

  const candidates: PullResistorCandidate[] = footprints
    .filter((footprint) => roleFor(footprint.reference, input.roles)?.role === "resistor")
    .flatMap((footprint) => {
      const nets = Array.from(new Set(footprint.pads.map((pad) => pad.netName).filter(Boolean))) as string[];
      if (nets.length !== 2) {
        return [];
      }
      const classified = nets.map((name) => classifyElectricalNet(name, input.inventory));
      const power = classified.find((net) => net.classification === "power");
      const ground = classified.find((net) => net.classification === "ground");
      const signal = classified.find((net) => net.classification === "signal");
      if (!signal || (!power && !ground)) {
        return [];
      }
      const inventoryNet = input.inventory.nets.find((net) => net.name.toUpperCase() === signal.name.toUpperCase());
      return [{
        reference: footprint.reference ?? "unknown-resistor",
        value: footprint.value,
        footprint: footprint.footprintName,
        signalNet: signal.name,
        biasNet: (power ?? ground)!.name,
        biasType: power ? "pull-up" : "pull-down",
        valueClass: classifyPullValue(footprint.value),
        relatedSignalClass: inventoryNet?.classification ?? "Unknown",
        x: footprint.x,
        y: footprint.y,
        confidence: "inferred-high",
        evidence: [
          evidence("pcb-layout", `${footprint.reference} has one pad on signal net ${signal.name} and one pad on ${(power ?? ground)!.name}.`, "direct"),
          evidence("net-inventory", `${(power ?? ground)!.name} is classified as ${(power ?? ground)!.classification}.`, (power ?? ground)!.confidence)
        ],
        limitations: ["Candidate is based on two-terminal pad-net topology only; datasheet intent is not validated."]
      }];
    });

  const findings = candidates.map((candidate) =>
    issue({
      id: `${candidate.biasType}-${candidate.reference}`,
      type: candidate.biasType === "pull-up" ? "pull-up-evidence" : "pull-down-evidence",
      title: `${candidate.reference} appears to be a ${candidate.biasType}`,
      severity: "informational",
      confidence: candidate.confidence,
      affectedComponent: candidate.reference,
      affectedNet: candidate.signalNet,
      relatedComponents: [candidate.reference],
      evidence: candidate.evidence,
      whyItMatters: "A resistor from a signal net to power or ground can provide bias evidence.",
      recommendation: "Confirm the required bias value and rail against the relevant device datasheet.",
      limitations: candidate.limitations,
      requiredFilesForStrongerValidation: [".kicad_sch", "schematic symbol properties", "component datasheets"]
    })
  );

  const requirements = input.inventory.nets
    .map(requirementForNet)
    .filter(Boolean)
    .map((requirement) => {
      const pulls = candidates.filter((candidate) => candidate.signalNet.toUpperCase() === requirement!.netName.toUpperCase());
      if (pulls.length === 0) {
        if (requirement!.expectedBias === "pull-up" || requirement!.expectedBias === "either") {
          findings.push(issue({
            id: `bias-missing-${requirement!.netName}`,
            type: "bias-missing-evidence",
            title: `${requirement!.netName} has no discrete bias evidence`,
            severity: requirement!.signalClass === "I2C" ? "medium" : "low",
            confidence: requirement!.confidence,
            affectedNet: requirement!.netName,
            evidence: requirement!.evidence,
            whyItMatters: "Some signal classes often need a defined idle state, but this depends on connected devices.",
            recommendation: "Review the schematic and device datasheets. Treat this as missing evidence, not a confirmed design error.",
            limitations: requirement!.limitations,
            requiredFilesForStrongerValidation: [".kicad_sch", "component datasheets", "schematic symbol properties"]
          }));
        }
        return requirement!;
      }
      return {
        ...requirement!,
        status: "bias-evidence-found" as const,
        evidence: [...requirement!.evidence, ...pulls.flatMap((candidate) => candidate.evidence)]
      };
    });

  return {
    available: true,
    candidates,
    requirements,
    findings,
    limitations,
    requiredFilesForStrongerValidation: [".kicad_sch", "schematic symbol properties", "component datasheets"]
  };
}
