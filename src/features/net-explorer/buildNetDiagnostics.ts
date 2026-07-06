import type { NormalizedNet, NormalizedNetDiagnostic } from "../../domain";

export function buildInventoryDiagnostics(nets: readonly NormalizedNet[]): readonly NormalizedNetDiagnostic[] {
  const diagnostics: NormalizedNetDiagnostic[] = [];
  const names = new Set(nets.map((net) => net.name.toUpperCase()));

  nets.forEach((net) => {
    if (net.name.toUpperCase().includes("USB_D+") && !names.has("USB_D-")) {
      diagnostics.push({
        id: `${net.id}-usb-pair-incomplete`,
        severity: "medium",
        confidence: "inferred-medium",
        message:
          "Differential pair naming appears incomplete: USB_D+ observed without USB_D-. Not a validation failure."
      });
    }

    if (net.name.toUpperCase().includes("CAN_H") && !names.has("CAN_L")) {
      diagnostics.push({
        id: `${net.id}-can-pair-incomplete`,
        severity: "medium",
        confidence: "inferred-medium",
        message:
          "Differential pair naming appears incomplete: CAN_H observed without CAN_L. Not a validation failure."
      });
    }
  });

  return diagnostics;
}
