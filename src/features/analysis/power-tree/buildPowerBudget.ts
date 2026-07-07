import type { BomParseResult } from "../../parsers/bom/bomTypes";
import type { PowerBudgetEstimate, PowerRail } from "../../../domain/power";

function currentForReference(reference: string, bom?: BomParseResult): string | undefined {
  return bom?.rows.find((row) => row.referenceDesignators.some((item) => item.toUpperCase() === reference.toUpperCase()))?.currentRating;
}

export function buildPowerBudgets(rails: readonly PowerRail[], bom?: BomParseResult): readonly PowerBudgetEstimate[] {
  return rails.map((rail) => {
    const explicit = rail.connectedComponents
      .map((reference) => currentForReference(reference, bom))
      .filter(Boolean) as string[];

    return {
      railName: rail.name,
      knownLoadCount: explicit.length,
      unknownLoadCount: Math.max(rail.loadCandidates.length - explicit.length, 0),
      explicitCurrentValues: explicit,
      estimatedCurrent: explicit.length ? explicit.join(" + ") : "unknown",
      confidence: explicit.length ? "inferred-medium" : "missing-data",
      limitations: [
        explicit.length
          ? "Current values are copied from parsed BOM current-rating fields only; regulator margin is not evaluated."
          : "Current unknown because no current rating or datasheet data was provided."
      ]
    };
  });
}
