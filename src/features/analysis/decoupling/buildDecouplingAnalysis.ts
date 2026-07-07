import type {
  ComponentRoleCandidate,
  DecouplingAnalysisResult,
  DecouplingCandidate,
  IcPowerPinCandidate
} from "../../../domain/analysis";
import type { NormalizedNetInventory } from "../../../domain/nets";
import type { KiCadPcbFootprint } from "../../parsers/kicad-pcb/kicadPcbTypes";
import { evidence, issue } from "../shared/analysisEvidence";
import { classifyElectricalNet } from "../shared/electricalNets";
import { distanceMm } from "../shared/geometry";
import { classifyCapacitorRole } from "../shared/valueParsing";

function roleFor(reference: string | undefined, roles: readonly ComponentRoleCandidate[]) {
  if (!reference) {
    return undefined;
  }
  return roles.find((role) => role.reference.toUpperCase() === reference.toUpperCase());
}

function connectedPowerGround(footprint: KiCadPcbFootprint, inventory: NormalizedNetInventory) {
  const nets = Array.from(new Set(footprint.pads.map((pad) => pad.netName).filter(Boolean))) as string[];
  const classified = nets.map((name) => classifyElectricalNet(name, inventory));
  return {
    power: classified.filter((net) => net.classification === "power"),
    ground: classified.filter((net) => net.classification === "ground")
  };
}

function buildCapacitorCandidates(input: {
  footprints: readonly KiCadPcbFootprint[];
  roles: readonly ComponentRoleCandidate[];
  inventory: NormalizedNetInventory;
}): readonly DecouplingCandidate[] {
  return input.footprints
    .filter((footprint) => roleFor(footprint.reference, input.roles)?.role === "capacitor")
    .map((footprint) => {
      const nets = connectedPowerGround(footprint, input.inventory);
      const hasPowerGround = nets.power.length > 0 && nets.ground.length > 0;
      const capRole = classifyCapacitorRole(footprint.value);
      const candidateEvidence = [
        evidence("pcb-layout", `${footprint.reference ?? "Capacitor"} has ${footprint.pads.length} parsed pad(s).`, "direct"),
        ...nets.power.map((net) => evidence("net-inventory", `${footprint.reference} pad connects to likely power net ${net.name}.`, net.confidence)),
        ...nets.ground.map((net) => evidence("net-inventory", `${footprint.reference} pad connects to likely ground net ${net.name}.`, net.confidence))
      ];

      return {
        reference: footprint.reference ?? "unknown-capacitor",
        value: footprint.value,
        footprint: footprint.footprintName,
        connectedPowerNet: nets.power[0]?.name,
        connectedGroundNet: nets.ground[0]?.name,
        x: footprint.x,
        y: footprint.y,
        role: hasPowerGround ? capRole : "unknown-capacitor",
        confidence: hasPowerGround ? "inferred-high" : capRole === "unknown-capacitor" ? "inferred-low" : "inferred-medium",
        evidence: candidateEvidence,
        limitations: [
          hasPowerGround
            ? "Candidate is based on parsed pad-net names only; full electrical validation is not complete."
            : "Power-to-ground pad evidence is incomplete, so this capacitor cannot be confirmed as a decoupling candidate."
        ]
      };
    });
}

export function buildDecouplingAnalysis(input: {
  footprints?: readonly KiCadPcbFootprint[];
  roles: readonly ComponentRoleCandidate[];
  inventory: NormalizedNetInventory;
}): DecouplingAnalysisResult {
  const footprints = input.footprints ?? [];
  const limitations: string[] = [
    "Phase 8 decoupling analysis is heuristic and evidence-based; full electrical validation is not complete."
  ];

  if (footprints.length === 0) {
    return {
      available: false,
      candidates: [],
      icPowerPins: [],
      findings: [
        issue({
          id: "decoupling-no-pad-net-data",
          type: "analysis-limitation",
          title: "Cannot determine decoupling because pad-net data is unavailable",
          severity: "informational",
          confidence: "missing-data",
          evidence: [evidence("pcb-layout", "No parsed PCB footprints were available for pad-net analysis.", "missing-data")],
          whyItMatters: "Decoupling evidence depends on knowing which capacitor pads connect to power and ground nets.",
          recommendation: "Upload a supported PCB layout with pad-net data for stronger Phase 8 analysis.",
          limitations,
          requiredFilesForStrongerValidation: [".kicad_pcb with footprint pads and net names", ".kicad_sch", "BOM"]
        })
      ],
      limitations,
      requiredFilesForStrongerValidation: [".kicad_pcb with footprint pads and net names", ".kicad_sch", "BOM"]
    };
  }

  const candidates = buildCapacitorCandidates({
    footprints,
    roles: input.roles,
    inventory: input.inventory
  });
  const matchingCandidates = candidates.filter((candidate) => candidate.connectedPowerNet && candidate.connectedGroundNet);
  const findings = matchingCandidates.map((candidate) =>
    issue({
      id: `decoupling-candidate-${candidate.reference}`,
      type: "decoupling-evidence",
      title: `${candidate.reference} is a decoupling candidate`,
      severity: "informational",
      confidence: candidate.confidence,
      affectedComponent: candidate.reference,
      affectedNet: candidate.connectedPowerNet,
      relatedComponents: [candidate.reference],
      evidence: candidate.evidence,
      whyItMatters: "A capacitor between a likely power net and likely ground net can provide decoupling evidence.",
      recommendation: "Use this as evidence only; confirm placement and required capacitance against the component datasheet.",
      limitations: candidate.limitations,
      requiredFilesForStrongerValidation: [".kicad_sch", "BOM values", "component datasheets"]
    })
  );

  const icPowerPins: IcPowerPinCandidate[] = footprints
    .filter((footprint) => {
      const role = roleFor(footprint.reference, input.roles)?.role;
      return role === "ic" || role === "programmable-ic" || role === "active-device" || role === "regulator-power-ic";
    })
    .map((footprint) => {
      const nets = connectedPowerGround(footprint, input.inventory);
      const powerNames = nets.power.map((net) => net.name);
      const groundNames = nets.ground.map((net) => net.name);
      const matching = matchingCandidates.filter(
        (candidate) =>
          candidate.connectedPowerNet &&
          candidate.connectedGroundNet &&
          powerNames.includes(candidate.connectedPowerNet) &&
          groundNames.includes(candidate.connectedGroundNet)
      );
      const nearest = matching
        .map((candidate) => ({ candidate, distance: distanceMm(footprint, candidate) }))
        .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY))[0];
      const hasPowerGround = powerNames.length > 0 && groundNames.length > 0;
      const nearestDistance = nearest?.distance;
      const status =
        !hasPowerGround
          ? "cannot-determine"
          : !nearest
            ? "missing-evidence"
            : nearestDistance === undefined
              ? "likely-present"
              : nearestDistance > 15
                ? "suspicious"
                : "likely-present";

      const icEvidence = [
        evidence("pcb-layout", `${footprint.reference ?? "IC"} has ${powerNames.length} likely power net(s) and ${groundNames.length} likely ground net(s).`, "direct"),
        ...(nearest ? [evidence("pcb-layout", `${nearest.candidate.reference} matches an IC power/ground net pair.`, nearest.candidate.confidence)] : [])
      ];

      if (status === "missing-evidence") {
        findings.push(issue({
          id: `decoupling-missing-${footprint.reference}`,
          type: "decoupling-missing-evidence",
          title: `${footprint.reference} has no matching decoupling evidence`,
          severity: "medium",
          confidence: "inferred-medium",
          affectedComponent: footprint.reference,
          affectedNet: powerNames.join(", "),
          evidence: icEvidence,
          whyItMatters: "IC power pins commonly need local decoupling, but Phase 8 found no capacitor evidence on the same power/ground pair.",
          recommendation: "Check schematic, placement, and datasheet requirements. Treat this as missing evidence, not an absolute failure.",
          limitations: ["Matching is based on parsed pad-net names only; no datasheet or full schematic-to-PCB validation is complete."],
          requiredFilesForStrongerValidation: [".kicad_sch", "BOM values", "placement coordinates", "component datasheets"]
        }));
      } else if (status === "suspicious") {
        findings.push(issue({
          id: `decoupling-distance-${footprint.reference}`,
          type: "decoupling-distance",
          title: `${footprint.reference} matching capacitor appears distant`,
          severity: "low",
          confidence: "inferred-medium",
          affectedComponent: footprint.reference,
          affectedNet: powerNames.join(", "),
          relatedComponents: nearest ? [nearest.candidate.reference] : [],
          evidence: [...icEvidence, evidence("pcb-layout", `Approximate distance is ${nearestDistance?.toFixed(2)} mm.`, "inferred-medium")],
          whyItMatters: "Large distance can make local decoupling less effective, depending on layout and component requirements.",
          recommendation: "Review capacitor placement manually against the IC datasheet and board layout.",
          limitations: ["Distance is Euclidean footprint-origin distance only; routing path and layer stack are not analyzed."],
          requiredFilesForStrongerValidation: ["placement coordinates", "component datasheets", "full layout review"]
        }));
      }

      return {
        reference: footprint.reference ?? "unknown-ic",
        value: footprint.value,
        footprint: footprint.footprintName,
        x: footprint.x,
        y: footprint.y,
        powerPadCount: footprint.pads.filter((pad) => pad.netName && powerNames.includes(pad.netName)).length,
        groundPadCount: footprint.pads.filter((pad) => pad.netName && groundNames.includes(pad.netName)).length,
        powerNetNames: powerNames,
        groundNetNames: groundNames,
        decouplingStatus: status,
        nearestMatchingCapacitor: nearest?.candidate.reference,
        nearestDistanceMm: nearestDistance,
        confidence: status === "cannot-determine" ? "missing-data" : nearest ? "inferred-high" : "inferred-medium",
        evidence: icEvidence,
        limitations: [
          status === "cannot-determine"
            ? "Cannot determine decoupling coverage because power/ground pad evidence was not identified."
            : "Decoupling coverage is heuristic; full electrical validation is not complete."
        ]
      };
    });

  return {
    available: true,
    candidates,
    icPowerPins,
    findings,
    limitations,
    requiredFilesForStrongerValidation: [".kicad_sch", "BOM values", "placement coordinates", "component datasheets"]
  };
}
