import type { FirmwareMcuCandidate, FirmwarePinMapEntry } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import type { NetClassification } from "../../domain/nets";
import { evidence } from "../analysis/shared/analysisEvidence";

function classifyDirection(classification: NetClassification): FirmwarePinMapEntry["direction"] {
  if (classification === "Power") return "power";
  if (classification === "Ground") return "ground";
  if (classification === "UART" || classification === "I2C" || classification === "SPI" || classification === "USB" || classification === "CAN") return "bidirectional";
  if (classification === "Reset" || classification === "Boot/strap" || classification === "Enable" || classification === "Fault/interrupt" || classification === "ADC" || classification === "Sensor input") return "input";
  if (classification === "PWM" || classification === "Motor control") return "output";
  return "unknown";
}

function portPin(name?: string): string | undefined {
  return name?.match(/\b(?:GPIO\d+|IO\d+|P[A-Z]\d+|A\d+|D\d+|ADC\d*_?CH\d+)\b/i)?.[0];
}

export function buildFirmwarePinMap(project: NormalizedPCBProject, mcus: readonly FirmwareMcuCandidate[]): readonly FirmwarePinMapEntry[] {
  return mcus.flatMap((mcu) => {
    const symbol = project.schematic.kicadSchematic?.symbols.find((item) => item.reference?.toUpperCase() === mcu.reference.toUpperCase());
    const footprint = project.board.kicadPcb?.footprints.find((item) => item.reference?.toUpperCase() === mcu.reference.toUpperCase());
    const symbolEntries = symbol?.pins.map((pin, index) => {
      const netName = footprint?.pads.find((pad) => pad.number === pin.number)?.netName;
      const net = netName ? project.netInventory.nets.find((item) => item.name.toUpperCase() === netName.toUpperCase()) : undefined;
      const classification = net?.classification ?? "Unknown";
      return {
        mcuReference: mcu.reference,
        physicalPin: pin.number ?? "Unknown physical pin",
        symbolPinName: pin.name ?? "Unknown pin name",
        portPinName: portPin(pin.name),
        netName,
        connectedComponentReferences: net?.connectedPcbFootprints.filter((ref) => ref.toUpperCase() !== mcu.reference.toUpperCase()) ?? [],
        connectedConnectorPins: [],
        peripheralClassification: classification,
        direction: classifyDirection(classification),
        voltageDomain: classification === "Power" ? netName : undefined,
        pullEvidence: project.analysis.pullResistors.candidates.filter((pull) => pull.signalNet === netName).map((pull) => `${pull.reference} ${pull.biasType} to ${pull.biasNet}`),
        safetyConcern: classification === "Reset" || classification === "Boot/strap" ? "Boot/reset state requires firmware bring-up caution." : undefined,
        initializationNote: classification === "Unknown" ? "Pad/net-level mapping only; review schematic symbol and datasheet." : `Configure according to ${classification} role after datasheet review.`,
        evidence: [
          evidence("schematic", `${mcu.reference} symbol pin ${pin.number ?? index} ${pin.name ?? "has no pin name"} parsed from schematic library data.`, pin.name ? "direct" : "missing-data"),
          ...(netName ? [evidence("pcb-layout", `${mcu.reference} pad ${pin.number} connects to net ${netName}.`, "direct")] : [])
        ],
        confidence: pin.name && netName ? "inferred-medium" : pin.name || netName ? "inferred-low" : "missing-data",
        limitations: [
          netName ? "Schematic symbol pin and PCB pad are matched by number only; schematic-to-PCB validation is not complete." : "Net name unavailable for this pin; requires schematic connectivity or PCB pad-net data.",
          "Firmware pin behavior requires datasheet review."
        ]
      } satisfies FirmwarePinMapEntry;
    }) ?? [];

    if (symbolEntries.length > 0) return symbolEntries;

    return (footprint?.pads ?? []).map((pad) => {
      const net = pad.netName ? project.netInventory.nets.find((item) => item.name.toUpperCase() === pad.netName?.toUpperCase()) : undefined;
      const classification = net?.classification ?? "Unknown";
      return {
        mcuReference: mcu.reference,
        physicalPin: pad.number || "Unknown physical pin",
        symbolPinName: "Unknown pin name",
        portPinName: undefined,
        netName: pad.netName,
        connectedComponentReferences: net?.connectedPcbFootprints.filter((ref) => ref.toUpperCase() !== mcu.reference.toUpperCase()) ?? [],
        connectedConnectorPins: [],
        peripheralClassification: classification,
        direction: classifyDirection(classification),
        voltageDomain: classification === "Power" ? pad.netName : undefined,
        pullEvidence: project.analysis.pullResistors.candidates.filter((pull) => pull.signalNet === pad.netName).map((pull) => `${pull.reference} ${pull.biasType} to ${pull.biasNet}`),
        safetyConcern: classification === "Reset" || classification === "Boot/strap" ? "Boot/reset state requires firmware bring-up caution." : undefined,
        initializationNote: "Pad/net-level mapping only. Requires schematic symbol pin data or datasheet.",
        evidence: [evidence("pcb-layout", `${mcu.reference} pad ${pad.number || "unknown"} connects to ${pad.netName ?? "unknown net"}.`, pad.netName ? "direct" : "missing-data")],
        confidence: pad.netName ? "inferred-low" : "missing-data",
        limitations: ["Unknown pin name. Pad/net-level mapping only.", "Requires schematic symbol pin data or datasheet."]
      } satisfies FirmwarePinMapEntry;
    });
  });
}
