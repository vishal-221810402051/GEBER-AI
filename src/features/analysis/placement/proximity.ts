import type { ComponentProximityResult, NormalizedPlacementComponent } from "../../../domain/placement";
import { evidence } from "../shared/analysisEvidence";
import { distanceMm } from "../shared/geometry";

export function proximityBetween(
  source: NormalizedPlacementComponent,
  target: NormalizedPlacementComponent,
  category: ComponentProximityResult["category"],
  thresholds: { local: number; suspicious: number }
): ComponentProximityResult {
  const distance = distanceMm(source, target);
  const status =
    distance === undefined
      ? "cannot-assess"
      : distance <= thresholds.local
        ? "local-evidence"
        : distance <= thresholds.suspicious
          ? "moderate-evidence"
          : "suspicious";

  return {
    sourceReference: source.reference,
    targetReference: target.reference,
    distanceMm: distance,
    category,
    status,
    confidence: distance === undefined ? "missing-data" : "inferred-medium",
    evidence: [
      evidence(
        "heuristic",
        distance === undefined
          ? `Cannot assess proximity for ${source.reference} and ${target.reference}; coordinates are incomplete.`
          : `Heuristic proximity check found ${distance.toFixed(2)} mm between ${source.reference} and ${target.reference}.`,
        distance === undefined ? "missing-data" : "inferred-medium"
      )
    ],
    limitations: ["Distance uses component origin coordinates only; package body, routing, and mechanical constraints are not validated."]
  };
}

export function nearestComponent(
  source: NormalizedPlacementComponent,
  targets: readonly NormalizedPlacementComponent[]
): NormalizedPlacementComponent | undefined {
  return targets
    .filter((target) => target.reference !== source.reference)
    .map((target) => ({ target, distance: distanceMm(source, target) ?? Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.distance - b.distance)[0]?.target;
}
