import type { PowerRail, VoltageRegulatorCandidate } from "../../../domain/power";
import { evidence, issue } from "../shared/analysisEvidence";

export function buildPowerTreeFindings(input: {
  rails: readonly PowerRail[];
  regulators: readonly VoltageRegulatorCandidate[];
}) {
  const findings = input.rails.flatMap((rail) => [
    issue({
      id: `power-rail-${rail.name}`,
      type: "analysis-limitation",
      title: `Power rail ${rail.name} detected`,
      severity: "informational",
      confidence: rail.confidence,
      affectedNet: rail.name,
      relatedComponents: rail.connectedComponents,
      evidence: rail.evidence,
      whyItMatters: "Detected rails provide the starting point for power tree review.",
      recommendation: "Use this as evidence only; confirm rail source, loads, and limits from schematic and datasheets.",
      limitations: rail.limitations,
      requiredFilesForStrongerValidation: [".kicad_sch", "PCB pad-net data", "BOM with current ratings", "regulator part numbers"]
    }),
    ...(rail.sourceCandidates.length === 0
      ? [issue({
          id: `power-rail-no-source-${rail.name}`,
          type: "analysis-limitation",
          title: `${rail.name} has loads but no source candidate found`,
          severity: "low",
          confidence: "inferred-medium",
          affectedNet: rail.name,
          relatedComponents: rail.connectedComponents,
          evidence: [evidence("heuristic", `${rail.name} has ${rail.loadCandidates.length} load candidate(s) and no source candidate.`, "inferred-medium")],
          whyItMatters: "A rail without a detected source may indicate missing schematic/BOM evidence or unsupported topology.",
          recommendation: "Review schematic source path and regulator/connector metadata manually.",
          limitations: ["Source detection is heuristic and may miss valid topologies."],
          requiredFilesForStrongerValidation: [".kicad_sch", "regulator part numbers", "connector pinout"]
        })]
      : [])
  ]);

  input.regulators.forEach((regulator) => {
    findings.push(issue({
      id: `regulator-candidate-${regulator.reference}`,
      type: "analysis-limitation",
      title: `${regulator.reference} is a regulator candidate`,
      severity: "informational",
      confidence: regulator.confidence,
      affectedComponent: regulator.reference,
      affectedNet: regulator.connectedPowerNets.join(", "),
      relatedComponents: regulator.nearbyCapacitors,
      evidence: regulator.evidence,
      whyItMatters: "Regulators often define rail sources, but pinout and datasheet validation are required.",
      recommendation: "Confirm regulator pinout, input/output rails, current rating, and capacitor requirements from datasheet.",
      limitations: regulator.limitations,
      requiredFilesForStrongerValidation: [".kicad_sch", "BOM part numbers", "component datasheets"]
    }));
  });

  return findings;
}
