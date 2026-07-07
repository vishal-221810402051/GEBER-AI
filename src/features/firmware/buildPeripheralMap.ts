import type { FirmwareBus, FirmwarePeripheral, FirmwarePinMapEntry } from "../../domain/firmware";
import type { NetClassification } from "../../domain/nets";

const busMap: Partial<Record<NetClassification, FirmwareBus>> = {
  UART: "UART",
  I2C: "I2C",
  SPI: "SPI",
  USB: "USB",
  CAN: "CAN",
  PWM: "PWM",
  ADC: "ADC",
  GPIO: "GPIO",
  Reset: "Reset",
  "Boot/strap": "Boot/strap",
  Enable: "Enable",
  "Fault/interrupt": "Fault/interrupt",
  "Programming/debug": "Programming/debug",
  Clock: "Clock/crystal",
  "Motor control": "Motor control",
  "Sensor input": "Sensor input"
};

export function buildPeripheralMap(pinMap: readonly FirmwarePinMapEntry[]): readonly FirmwarePeripheral[] {
  const byType = new Map<FirmwareBus, FirmwarePinMapEntry[]>();
  pinMap.forEach((entry) => {
    const type = busMap[entry.peripheralClassification] ?? "Unknown";
    if (type === "Unknown" || entry.direction === "power" || entry.direction === "ground") return;
    byType.set(type, [...(byType.get(type) ?? []), entry]);
  });

  return Array.from(byType.entries()).map(([type, entries]) => ({
    peripheralType: type,
    busName: type,
    nets: Array.from(new Set(entries.map((entry) => entry.netName).filter(Boolean))) as string[],
    mcuPins: entries.map((entry) => `${entry.mcuReference}:${entry.physicalPin}`),
    connectedDevices: Array.from(new Set(entries.flatMap((entry) => entry.connectedComponentReferences))),
    pullEvidence: entries.flatMap((entry) => entry.pullEvidence),
    configurationNotes: [
      type === "I2C" ? "Configure open-drain where applicable; this is generic guidance and not MCU-specific validation." : `Configure ${type} only after datasheet and board bring-up review.`
    ],
    initializationNotes: [`Initialize ${type} after confirming voltage domains, pin mux, and safe default states.`],
    confidence: entries.some((entry) => entry.confidence === "inferred-medium") ? "inferred-medium" : "inferred-low",
    limitations: [
      "Peripheral grouping is based on net classification and pin-map evidence only.",
      "Peripheral configuration is not validated for a specific MCU datasheet."
    ]
  }));
}
