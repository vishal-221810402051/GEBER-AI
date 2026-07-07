import type { AnalysisConfidence, ComponentRoleCandidate } from "../../../domain/analysis";
import type { NormalizedPlacementComponent } from "../../../domain/placement";
import type { KiCadPcbFootprint } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { PlacementParseResult } from "../../parsers/placement/placementTypes";
import { evidence } from "../shared/analysisEvidence";
import { distanceMm } from "../shared/geometry";

function roleFor(reference: string, roles: readonly ComponentRoleCandidate[]) {
  return roles.find((role) => role.reference.toUpperCase() === reference.toUpperCase());
}

function sideFromLayer(layer?: string): "top" | "bottom" | "unknown" {
  if (!layer) return "unknown";
  if (layer.toLowerCase().startsWith("f.")) return "top";
  if (layer.toLowerCase().startsWith("b.")) return "bottom";
  return "unknown";
}

export function normalizePlacementComponents(input: {
  footprints?: readonly KiCadPcbFootprint[];
  placement?: PlacementParseResult;
  roles: readonly ComponentRoleCandidate[];
}): readonly NormalizedPlacementComponent[] {
  const byRef = new Map<string, { footprint?: KiCadPcbFootprint; placement?: PlacementParseResult["rows"][number] }>();

  input.footprints?.forEach((footprint) => {
    if (!footprint.reference) return;
    byRef.set(footprint.reference.toUpperCase(), { ...byRef.get(footprint.reference.toUpperCase()), footprint });
  });

  input.placement?.rows.forEach((row) => {
    if (!row.reference) return;
    byRef.set(row.reference.toUpperCase(), { ...byRef.get(row.reference.toUpperCase()), placement: row });
  });

  return Array.from(byRef.entries()).map(([reference, sources]) => {
    const role = roleFor(reference, input.roles);
    const pcbPoint = { x: sources.footprint?.x, y: sources.footprint?.y };
    const placementPoint = { x: sources.placement?.x, y: sources.placement?.y };
    const delta = distanceMm(pcbPoint, placementPoint);
    const source: NormalizedPlacementComponent["source"] = sources.footprint && sources.placement ? "both" : sources.footprint ? "pcb" : "pick-and-place";
    const missingFields = [
      sources.footprint?.x === undefined && sources.placement?.x === undefined ? "x-coordinate" : undefined,
      sources.footprint?.y === undefined && sources.placement?.y === undefined ? "y-coordinate" : undefined,
      sources.footprint?.rotation === undefined && sources.placement?.rotation === undefined ? "rotation" : undefined,
      !sources.footprint?.layer && !sources.placement?.side ? "side" : undefined
    ].filter(Boolean) as string[];
    const confidence: AnalysisConfidence = missingFields.length ? "inferred-medium" : source === "both" ? "direct" : "inferred-high";

    return {
      reference,
      role: role?.role ?? "unknown",
      value: sources.footprint?.value ?? sources.placement?.value,
      footprint: sources.footprint?.footprintName ?? sources.placement?.footprint,
      source,
      pcbX: sources.footprint?.x,
      pcbY: sources.footprint?.y,
      placementX: sources.placement?.x,
      placementY: sources.placement?.y,
      x: sources.footprint?.x ?? sources.placement?.x,
      y: sources.footprint?.y ?? sources.placement?.y,
      coordinateDelta: delta,
      rotation: sources.footprint?.rotation ?? sources.placement?.rotation,
      side: sideFromLayer(sources.footprint?.layer) === "unknown" ? sources.placement?.side ?? "unknown" : sideFromLayer(sources.footprint?.layer),
      confidence,
      evidence: [
        ...(sources.footprint ? [evidence("pcb-layout", `${reference} has PCB footprint coordinates.`, "direct")] : []),
        ...(sources.placement ? [evidence("placement", `${reference} has pick-and-place row coordinates.`, sources.placement.confidence)] : []),
        ...(delta !== undefined ? [evidence("heuristic", `Coordinate difference observed: ${delta.toFixed(2)}. Placement-to-PCB comparison is heuristic and unit assumptions may affect confidence.`, "inferred-medium")] : [])
      ],
      missingFields,
      relatedNets: sources.footprint?.padNetNames ?? []
    };
  }).sort((a, b) => a.reference.localeCompare(b.reference, undefined, { numeric: true }));
}
