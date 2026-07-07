import type { CapacitorDecouplingRole, PullResistorValueClass } from "../../../domain/analysis";

function normalized(value?: string): string {
  return (value ?? "").replace(/\s+/g, "").toLowerCase();
}

export function classifyCapacitorRole(value?: string): CapacitorDecouplingRole {
  const text = normalized(value);
  if (!text) {
    return "unknown-capacitor";
  }
  if (/^(?:100n|100nf|0\.1u|0\.1uf|1u|1uf)$/.test(text)) {
    return "local-decoupling-candidate";
  }
  if (/^(?:4\.7u|4\.7uf|10u|10uf|22u|22uf|47u|47uf)$/.test(text)) {
    return "bulk-capacitor-candidate";
  }
  return "unknown-capacitor";
}

export function classifyPullValue(value?: string): PullResistorValueClass {
  const text = normalized(value);
  if (!text) {
    return "unknown-value";
  }
  if (/^(?:1k|1000|1\.0k|2\.2k|2200)$/.test(text)) {
    return "strong-pull";
  }
  if (/^(?:4\.7k|4700|10k|10000)$/.test(text)) {
    return "typical-pull";
  }
  if (/^(?:47k|47000|100k|100000)$/.test(text)) {
    return "weak-pull";
  }
  return "suspicious-value";
}
