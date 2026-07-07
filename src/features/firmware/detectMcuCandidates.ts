import type { FirmwareMcuCandidate } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import { evidence } from "../analysis/shared/analysisEvidence";

const mcuPattern = /(?:ESP32|ESP32-S3|STM32|ATMEGA|ATTINY|RP2040|RP2350|NRF52|NRF53|PIC|SAMD|SAM\b|GD32|CH32|MSP430|LPC|KINETIS|I\.MX|FPGA|CPLD)/i;
const packagePattern = /(?:QFN|QFP|BGA|LQFP|TQFP|WROOM|WROVER|MODULE)/i;
const firmwareNetClasses = new Set([
  "Reset",
  "Boot/strap",
  "Programming/debug",
  "USB",
  "UART",
  "SPI",
  "I2C",
  "ADC",
  "PWM",
  "GPIO"
]);

function candidateType(text: string): FirmwareMcuCandidate["candidateType"] {
  if (/FPGA|CPLD/i.test(text)) return "fpga-cpld";
  if (/WROOM|WROVER|MODULE|SOC/i.test(text)) return "soc-module";
  if (mcuPattern.test(text)) return "mcu";
  return "unknown-programmable";
}

export function detectMcuCandidates(project: NormalizedPCBProject): readonly FirmwareMcuCandidate[] {
  const candidates = new Map<string, FirmwareMcuCandidate>();
  const add = (candidate: FirmwareMcuCandidate) => {
    const existing = candidates.get(candidate.reference.toUpperCase());
    if (!existing) {
      candidates.set(candidate.reference.toUpperCase(), candidate);
      return;
    }
    candidates.set(candidate.reference.toUpperCase(), {
      ...existing,
      value: existing.value ?? candidate.value,
      libraryId: existing.libraryId ?? candidate.libraryId,
      footprint: existing.footprint ?? candidate.footprint,
      bomDescription: existing.bomDescription ?? candidate.bomDescription,
      sourceFiles: Array.from(new Set([...existing.sourceFiles, ...candidate.sourceFiles])),
      evidence: [...existing.evidence, ...candidate.evidence],
      confidence: existing.confidence === "inferred-high" || candidate.confidence === "inferred-high" ? "inferred-high" : "inferred-medium",
      limitations: Array.from(new Set([...existing.limitations, ...candidate.limitations]))
    });
  };

  project.schematic.kicadSchematic?.symbols.forEach((symbol) => {
    if (!symbol.reference) return;
    const text = `${symbol.reference} ${symbol.value ?? ""} ${symbol.libId ?? ""} ${symbol.footprint ?? ""} ${symbol.description ?? ""}`;
    const netEvidence = project.netInventory.nets.some((net) => firmwareNetClasses.has(net.classification));
    if (!mcuPattern.test(text) && !packagePattern.test(text) && !netEvidence) return;
    add({
      reference: symbol.reference,
      candidateType: candidateType(text),
      value: symbol.value,
      libraryId: symbol.libId,
      footprint: symbol.footprint,
      sourceFiles: [symbol.sourceFileId],
      evidence: [evidence("schematic", `${symbol.reference} has firmware-relevant schematic metadata: ${text}.`, mcuPattern.test(text) ? "inferred-high" : "inferred-medium")],
      confidence: mcuPattern.test(text) ? "inferred-high" : "inferred-medium",
      limitations: ["MCU candidate detection is heuristic; datasheet identity and firmware pin behavior are not validated."]
    });
  });

  project.board.kicadPcb?.footprints.forEach((footprint) => {
    if (!footprint.reference) return;
    const role = project.analysis.componentRoles.find((item) => item.reference.toUpperCase() === footprint.reference?.toUpperCase());
    const text = `${footprint.reference} ${footprint.value ?? ""} ${footprint.footprintName} ${footprint.description ?? ""}`;
    if (role?.role !== "programmable-ic" && !mcuPattern.test(text) && !packagePattern.test(text)) return;
    add({
      reference: footprint.reference,
      candidateType: candidateType(text),
      value: footprint.value,
      footprint: footprint.footprintName,
      sourceFiles: [project.board.kicadPcb?.sourceFileId ?? "pcb-layout"],
      evidence: [evidence("pcb-layout", `${footprint.reference} footprint/value suggests programmable device evidence: ${text}.`, role?.role === "programmable-ic" || mcuPattern.test(text) ? "inferred-high" : "inferred-medium")],
      confidence: role?.role === "programmable-ic" || mcuPattern.test(text) ? "inferred-high" : "inferred-medium",
      limitations: ["PCB footprint evidence does not prove firmware pin function or datasheet-specific behavior."]
    });
  });

  project.bom.bom?.rows.forEach((row) => {
    const text = `${row.value ?? ""} ${row.description ?? ""} ${row.manufacturerPartNumber ?? ""} ${row.footprint ?? ""}`;
    if (!mcuPattern.test(text)) return;
    row.referenceDesignators.forEach((reference) =>
      add({
        reference,
        candidateType: candidateType(text),
        value: row.value,
        footprint: row.footprint,
        bomDescription: row.description,
        sourceFiles: [row.sourceFileName],
        evidence: [evidence("bom", `${reference} BOM metadata suggests MCU/programming device: ${text}.`, "inferred-high")],
        confidence: "inferred-high",
        limitations: ["BOM metadata identifies a likely device family only; pin behavior still requires datasheet review."]
      })
    );
  });

  return Array.from(candidates.values()).sort((a, b) => a.reference.localeCompare(b.reference, undefined, { numeric: true }));
}
