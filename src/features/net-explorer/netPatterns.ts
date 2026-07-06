import type { NetClassification } from "../../domain";
import type { ClassificationConfidence } from "../intake/intakeTypes";

export type NetPattern = Readonly<{
  classification: NetClassification;
  confidence: ClassificationConfidence;
  pattern: RegExp;
  reason: string;
}>;

export const netPatterns: readonly NetPattern[] = [
  { classification: "Ground", confidence: "inferred-high", pattern: /^(GND|GNDA|AGND|DGND|PGND)$/i, reason: "Ground naming pattern." },
  { classification: "Power", confidence: "inferred-high", pattern: /^(\+?\d+V\d*|\+?5V|\+?3V3|VCC|VDD|VBUS|VIN|VBAT)$/i, reason: "Power rail naming pattern." },
  { classification: "I2C", confidence: "inferred-high", pattern: /(^|_)(SDA|SCL)$/i, reason: "I2C signal naming pattern." },
  { classification: "SPI", confidence: "inferred-high", pattern: /(^|_)(MOSI|MISO|SCK|SCLK|CS|NSS)$/i, reason: "SPI signal naming pattern." },
  { classification: "UART", confidence: "inferred-medium", pattern: /(^|_)(TX|RX|UART\d*_(TX|RX))$/i, reason: "UART signal naming pattern." },
  { classification: "USB", confidence: "inferred-high", pattern: /^(USB_)?D[+-]$/i, reason: "USB data signal naming pattern." },
  { classification: "CAN", confidence: "inferred-high", pattern: /^CAN[_-]?[HL]$/i, reason: "CAN differential signal naming pattern." },
  { classification: "Programming/debug", confidence: "inferred-high", pattern: /^(SWDIO|SWCLK|JTAG_TMS|JTAG_TCK|TMS|TCK|TDI|TDO)$/i, reason: "Programming/debug naming pattern." },
  { classification: "Reset", confidence: "inferred-high", pattern: /^(RESET|RST|NRST)$/i, reason: "Reset naming pattern." },
  { classification: "Enable", confidence: "inferred-medium", pattern: /(^|_)(EN|ENABLE)$/i, reason: "Enable naming pattern." },
  { classification: "Boot/strap", confidence: "inferred-medium", pattern: /(^|_)(BOOT|STRAP|IO0)$/i, reason: "Boot or strap naming pattern." },
  { classification: "ADC", confidence: "inferred-high", pattern: /(^|_)(ADC\d*|AIN\d*)$/i, reason: "ADC naming pattern." },
  { classification: "Sensor input", confidence: "inferred-medium", pattern: /(SENSE|SENSOR)/i, reason: "Sensor input naming pattern." },
  { classification: "PWM", confidence: "inferred-high", pattern: /PWM/i, reason: "PWM naming pattern." },
  { classification: "Motor control", confidence: "inferred-medium", pattern: /(MOTOR|STEP|DIR)/i, reason: "Motor control naming pattern." },
  { classification: "Clock", confidence: "inferred-medium", pattern: /(CLK|CLOCK|XTAL|OSC)/i, reason: "Clock naming pattern." },
  { classification: "Fault/interrupt", confidence: "inferred-medium", pattern: /(FAULT|INT|IRQ|ALERT)/i, reason: "Fault or interrupt naming pattern." },
  { classification: "Analog", confidence: "inferred-medium", pattern: /(ANALOG|ANA|AOUT)/i, reason: "Analog naming pattern." },
  { classification: "GPIO", confidence: "inferred-low", pattern: /^(GPIO|IO)\d+$/i, reason: "GPIO naming pattern." }
];
