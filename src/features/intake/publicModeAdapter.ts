import type { AnalysisMode } from "./intakeTypes";

export type PublicProjectMode = "inspect" | "firmware";

export type InternalPhaseBMode = Extract<AnalysisMode, "analyze" | "firmware">;

// Product Realignment Phase C will replace the internal mode model.
export function toInternalIntakeMode(mode: PublicProjectMode): InternalPhaseBMode {
  return mode === "firmware" ? "firmware" : "analyze";
}

export function fromInternalIntakeMode(mode: AnalysisMode): PublicProjectMode {
  return mode === "firmware" ? "firmware" : "inspect";
}
