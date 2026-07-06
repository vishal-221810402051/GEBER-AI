import type { NetClassificationResult } from "./netExplorerTypes";
import { netPatterns } from "./netPatterns";

export function classifyNet(name: string): NetClassificationResult {
  const normalized = name.trim();

  if (!normalized) {
    return {
      classification: "Unknown",
      confidence: "missing-data",
      evidence: "Net has no name.",
      reason: "No name is available for deterministic classification.",
      inferred: true
    };
  }

  const match = netPatterns.find((pattern) => pattern.pattern.test(normalized));

  if (!match) {
    return {
      classification: "Unknown",
      confidence: "inferred-low",
      evidence: `Net ${normalized} did not match a Phase 7 name pattern.`,
      reason: "No deterministic name pattern matched.",
      inferred: true
    };
  }

  return {
    classification: match.classification,
    confidence: match.confidence,
    evidence: `Net ${normalized} classified as ${match.classification} by name pattern.`,
    reason: match.reason,
    inferred: true
  };
}
