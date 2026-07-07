import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { ComponentProximityResult, PlacementAnalysisResult, PlacementFinding } from "../../../domain/placement";
import type { KiCadPcbParseResult } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { PlacementParseResult } from "../../parsers/placement/placementTypes";
import type { DecouplingAnalysisResult } from "../../../domain/analysis";
import { evidence, issue } from "../shared/analysisEvidence";
import { distanceMm } from "../shared/geometry";
import { normalizePlacementComponents } from "./normalizePlacementComponents";
import { nearestComponent, proximityBetween } from "./proximity";
import { placementFinding } from "./placementFindings";

function edgeDistance(component: { x?: number; y?: number }, box?: { minX: number; maxX: number; minY: number; maxY: number }) {
  if (!box || component.x === undefined || component.y === undefined) return undefined;
  return Math.min(
    Math.abs(component.x - box.minX),
    Math.abs(component.x - box.maxX),
    Math.abs(component.y - box.minY),
    Math.abs(component.y - box.maxY)
  );
}

export function buildPlacementAnalysis(input: {
  pcb?: KiCadPcbParseResult;
  placement?: PlacementParseResult;
  roles: readonly ComponentRoleCandidate[];
  decoupling: DecouplingAnalysisResult;
}): PlacementAnalysisResult {
  const components = normalizePlacementComponents({
    footprints: input.pcb?.footprints,
    placement: input.placement,
    roles: input.roles
  });
  const findings: PlacementFinding[] = [];
  const proximity = input.decoupling.icPowerPins
    .filter((ic) => ic.nearestMatchingCapacitor)
    .map((ic) => {
      const source = components.find((component) => component.reference === ic.reference);
      const target = components.find((component) => component.reference === ic.nearestMatchingCapacitor);
      return source && target ? proximityBetween(source, target, "decoupling-proximity", { local: 5, suspicious: 15 }) : undefined;
    })
    .filter((item): item is ComponentProximityResult => item !== undefined);

  proximity.forEach((item) => {
    if (item!.status === "suspicious" || item!.status === "cannot-assess") {
      findings.push(placementFinding({
        id: `placement-decoupling-${item!.sourceReference}-${item!.targetReference}`,
        category: "decoupling-proximity",
        title: `${item!.sourceReference} decoupling placement evidence is ${item!.status}`,
        severity: item!.status === "suspicious" ? "low" : "informational",
        proximity: item!,
        recommendation: "Review local decoupling placement manually against the IC datasheet and layout."
      }));
    }
  });

  const regulators = components.filter((component) => component.role === "regulator-power-ic");
  const capacitors = components.filter((component) => component.role === "capacitor");
  regulators.forEach((regulator) => {
    const nearest = nearestComponent(regulator, capacitors);
    if (!nearest) return;
    const result = proximityBetween(regulator, nearest, "regulator-capacitor-proximity", { local: 10, suspicious: 25 });
    if (result.status === "suspicious" || result.status === "cannot-assess") {
      findings.push(placementFinding({
        id: `placement-regulator-cap-${regulator.reference}`,
        category: "regulator-capacitor-proximity",
        title: `${regulator.reference} regulator capacitor proximity needs review`,
        severity: "low",
        proximity: result,
        recommendation: "Confirm input/output capacitor placement from regulator datasheet and board layout."
      }));
    }
  });

  const crystals = components.filter((component) => component.role === "crystal-oscillator");
  const ics = components.filter((component) => component.role === "ic" || component.role === "programmable-ic");
  crystals.forEach((crystal) => {
    const nearest = nearestComponent(crystal, ics);
    if (!nearest) return;
    const result = proximityBetween(crystal, nearest, "crystal-proximity", { local: 10, suspicious: 10 });
    if (result.status === "suspicious") {
      findings.push(placementFinding({
        id: `placement-crystal-${crystal.reference}`,
        category: "crystal-proximity",
        title: `${crystal.reference} appears distant from nearest IC`,
        severity: "low",
        proximity: result,
        recommendation: "Review oscillator placement, load capacitors, and routing manually."
      }));
    }
  });

  components.filter((component) => component.role === "connector").forEach((connector) => {
    const distance = edgeDistance(connector, input.pcb?.summary.boundingBox);
    if (distance === undefined) {
      findings.push({
        ...issue({
          id: `placement-connector-edge-${connector.reference}`,
          type: "analysis-limitation",
          title: `${connector.reference} edge access cannot be assessed`,
          severity: "informational",
          confidence: "missing-data",
          affectedComponent: connector.reference,
          evidence: [evidence("pcb-layout", "Board outline or connector coordinates are unavailable.", "missing-data")],
          whyItMatters: "Connector access often depends on proximity to the board edge and enclosure constraints.",
          recommendation: "Provide a PCB outline and review connector access mechanically.",
          limitations: ["No manufacturing or enclosure validation is performed."],
          requiredFilesForStrongerValidation: [".kicad_pcb with Edge.Cuts outline", "mechanical constraints"]
        }),
        placementCategory: "connector-edge-access"
      });
    } else if (distance > 10) {
      findings.push({
        ...issue({
          id: `placement-connector-deep-${connector.reference}`,
          type: "analysis-limitation",
          title: `${connector.reference} appears away from board edge`,
          severity: "informational",
          confidence: "inferred-medium",
          affectedComponent: connector.reference,
          evidence: [evidence("heuristic", `Connector edge distance is approximately ${distance.toFixed(2)} mm.`, "inferred-medium")],
          whyItMatters: "Connectors often need edge or enclosure access, but this depends on mechanical design.",
          recommendation: "Review connector accessibility in mechanical context.",
          limitations: ["Heuristic uses bounding box distance only; it does not validate assembly or enclosure fit."],
          requiredFilesForStrongerValidation: ["mechanical constraints", "enclosure model"]
        }),
        placementCategory: "connector-edge-access"
      });
    }
  });

  const nearestPairs = components.flatMap((component) => {
    const nearest = nearestComponent(component, components);
    const distance = nearest ? distanceMm(component, nearest) : undefined;
    return nearest && distance !== undefined && distance < 1
      ? [placementFinding({
          id: `placement-crowding-${component.reference}-${nearest.reference}`,
          category: "crowding",
          title: `${component.reference} and ${nearest.reference} have very close origins`,
          severity: "informational",
          proximity: proximityBetween(component, nearest, "crowding", { local: 1, suspicious: 1 }),
          recommendation: "Review component body dimensions and assembly clearance manually."
        })]
      : [];
  });
  findings.push(...nearestPairs.slice(0, 8));

  if (components.some((component) => component.missingFields.length > 0)) {
    findings.push({
      ...issue({
        id: "placement-data-completeness",
        type: "analysis-limitation",
        title: "Some placement records have incomplete coordinates or side data",
        severity: "informational",
        confidence: "inferred-medium",
        evidence: [evidence("placement", "Placement completeness is derived from PCB and pick-and-place coordinate fields.", "inferred-medium")],
        whyItMatters: "Incomplete placement data reduces confidence in proximity, accessibility, and density heuristics.",
        recommendation: "Provide both .kicad_pcb and pick-and-place data with coordinates, rotation, and side fields.",
        limitations: ["Placement-to-PCB comparison is heuristic and unit assumptions may affect confidence."],
        requiredFilesForStrongerValidation: [".kicad_pcb", "pick-and-place file", "board outline"]
      }),
      placementCategory: "data-completeness"
    });
  }

  return {
    available: components.length > 0,
    components,
    coordinateSourceSummary: {
      pcbOnly: components.filter((component) => component.source === "pcb").length,
      placementOnly: components.filter((component) => component.source === "pick-and-place").length,
      both: components.filter((component) => component.source === "both").length,
      missingCoordinates: components.filter((component) => component.x === undefined || component.y === undefined).length
    },
    proximity,
    findings,
    limitations: [
      "Placement findings are heuristic and evidence-based; assembly and manufacturing validation are not complete.",
      "Distances use component origin coordinates only unless richer geometry becomes available."
    ],
    requiredFilesForStrongerValidation: [".kicad_pcb", "pick-and-place file", "board outline", "mechanical constraints"]
  };
}
