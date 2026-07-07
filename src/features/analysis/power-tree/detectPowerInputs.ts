import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { PowerInputCandidate } from "../../../domain/power";
import type { KiCadPcbParseResult } from "../../parsers/kicad-pcb/kicadPcbTypes";
import { evidence } from "../shared/analysisEvidence";

function inputType(name: string): PowerInputCandidate["inputType"] {
  const upper = name.toUpperCase();
  if (upper.includes("VBUS") || upper.includes("USB")) return "usb-vbus";
  if (upper.includes("VBAT") || upper.includes("BAT")) return "battery";
  if (upper.includes("VIN")) return "vin";
  return "unknown";
}

export function detectPowerInputs(input: {
  pcb?: KiCadPcbParseResult;
  roles: readonly ComponentRoleCandidate[];
  powerNetNames: readonly string[];
}): readonly PowerInputCandidate[] {
  const connectorRefs = new Set(input.roles.filter((role) => role.role === "connector").map((role) => role.reference.toUpperCase()));
  const candidates: PowerInputCandidate[] = [];

  input.powerNetNames.forEach((netName) => {
    const type = inputType(netName);
    if (type !== "unknown") {
      candidates.push({
        netName,
        inputType: type,
        confidence: "inferred-high",
        evidence: [evidence("net-inventory", `${netName} looks like a power input net by name.`, "inferred-high")],
        limitations: ["Input role is name-based and not verified against schematic or connector pinout."]
      });
    }
  });

  input.pcb?.footprints
    .filter((footprint) => footprint.reference && connectorRefs.has(footprint.reference.toUpperCase()))
    .forEach((footprint) => {
      footprint.padNetNames
        .filter((netName) => input.powerNetNames.includes(netName))
        .forEach((netName) => {
          candidates.push({
            reference: footprint.reference,
            netName,
            inputType: inputType(netName) === "unknown" ? "connector" : inputType(netName),
            confidence: "inferred-medium",
            evidence: [evidence("pcb-layout", `${footprint.reference} connector footprint connects to power net ${netName}.`, "direct")],
            limitations: ["Connector power input role is heuristic; schematic intent and pinout are not validated."]
          });
        });
    });

  return candidates.filter((candidate, index, all) =>
    all.findIndex((item) => item.reference === candidate.reference && item.netName === candidate.netName) === index
  );
}
