import type { FirmwareDriverSuggestion, FirmwarePeripheral } from "../../domain/firmware";
import { evidence } from "../analysis/shared/analysisEvidence";

const modules: Record<string, string> = {
  I2C: "i2c_bus",
  SPI: "spi_bus",
  UART: "uart_console",
  USB: "usb_device",
  CAN: "can_bus",
  ADC: "adc_inputs",
  PWM: "pwm_outputs",
  GPIO: "gpio_manager",
  "Fault/interrupt": "fault_monitor",
  "Boot/strap": "boot_config",
  Reset: "boot_config",
  "Motor control": "motor_control",
  "Sensor input": "sensor_interface"
};

export function buildDriverSuggestions(peripherals: readonly FirmwarePeripheral[]): readonly FirmwareDriverSuggestion[] {
  const names = new Set(["board_pins", "connector_io"]);
  peripherals.forEach((peripheral) => names.add(modules[peripheral.peripheralType] ?? "board_pins"));
  return Array.from(names).map((moduleName) => ({
    moduleName,
    whySuggested: moduleName === "board_pins" ? "Central pin definitions help keep firmware mapping reviewable." : `Suggested from detected ${moduleName.replace(/_/g, " ")} evidence.`,
    evidence: [evidence("heuristic", `${moduleName} suggested from detected firmware manual evidence.`, "inferred-low")],
    confidence: moduleName === "board_pins" ? "inferred-medium" : "inferred-low",
    limitation: "Suggestion is architectural guidance only; no driver source code is generated or validated."
  }));
}
