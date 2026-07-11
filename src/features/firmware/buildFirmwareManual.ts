import type { FirmwareBringUpStep, FirmwareFinding, FirmwareManual } from "../../domain/firmware";
import type { NormalizedPCBProject } from "../../domain/project";
import { issue } from "../analysis/shared/analysisEvidence";
import { buildConnectorMap } from "./buildConnectorMap";
import { buildDriverSuggestions } from "./buildDriverSuggestions";
import { buildFirmwareChecklist } from "./buildFirmwareChecklist";
import { buildFirmwarePinMap } from "./buildFirmwarePinMap";
import { buildFirmwareSafetyNotes } from "./buildFirmwareSafetyNotes";
import { buildPeripheralMap } from "./buildPeripheralMap";
import { detectMcuCandidates } from "./detectMcuCandidates";
import { summarizeFirmwareManual } from "./summarizeFirmwareManual";

function buildBringUpSteps(): readonly FirmwareBringUpStep[] {
  return [
    {
      order: 1,
      title: "Review source evidence",
      description: "Confirm schematic evidence, detected Gerber/package presence, and connector evidence before using firmware guidance.",
      confidence: "inferred-medium",
      limitations: ["Firmware Mode is guidance only and does not replace datasheet review."]
    },
    {
      order: 2,
      title: "Validate power before peripherals",
      description: "Check voltage domains and current limits before enabling loads or buses.",
      confidence: "inferred-medium",
      limitations: ["Power tree analysis does not verify regulator sizing or thermal margin."]
    },
    {
      order: 3,
      title: "Bring up debug and reset path",
      description: "Confirm reset, boot, and programming/debug nets before application firmware.",
      confidence: "inferred-low",
      limitations: ["MCU-specific boot behavior requires datasheet review."]
    },
    {
      order: 4,
      title: "Initialize buses incrementally",
      description: "Enable one bus or peripheral group at a time and log observed behavior.",
      confidence: "inferred-low",
      limitations: ["Peripheral configuration is not validated in Phase 10."]
    }
  ];
}

export function buildFirmwareManual(project: NormalizedPCBProject): FirmwareManual {
  const mcuCandidates = detectMcuCandidates(project);
  const pinMap = buildFirmwarePinMap(project, mcuCandidates);
  const peripherals = buildPeripheralMap(pinMap);
  const connectors = buildConnectorMap(project, pinMap);
  const checklist = buildFirmwareChecklist(project, peripherals);
  const driverSuggestions = buildDriverSuggestions(peripherals);
  const safetyNotes = buildFirmwareSafetyNotes(project);
  const findings: FirmwareFinding[] = [];

  if (mcuCandidates.length === 0) {
    findings.push(issue({
      id: "firmware-no-mcu-candidate",
      type: "analysis-limitation",
      title: "No MCU candidate detected",
      severity: "informational",
      confidence: "missing-data",
      evidence: [],
      whyItMatters: "Firmware pin mapping requires a detected MCU or programmable IC candidate.",
      recommendation: "Provide schematic symbol properties that identify the programmable device; generated BOM evidence is deferred.",
      limitations: ["Unknown ICs are not promoted to MCU candidates without supporting evidence."],
      requiredFilesForStrongerValidation: [".kicad_sch", "schematic symbol properties", "MCU datasheet"]
    }));
  }

  if (pinMap.some((entry) => entry.symbolPinName === "Unknown pin name")) {
    findings.push(issue({
      id: "firmware-pad-level-only",
      type: "analysis-limitation",
      title: "Some firmware mappings are pad/net-level only",
      severity: "informational",
      confidence: "inferred-low",
      evidence: [],
      whyItMatters: "Firmware work needs datasheet pin names and pin mux information before configuration is trusted.",
      recommendation: "Review schematic symbol pins and the MCU datasheet before coding.",
      limitations: ["Pin names are not invented from net names."],
      requiredFilesForStrongerValidation: ["schematic symbol pin data", "MCU datasheet"]
    }));
  }

  const manualWithoutSummary = {
    available: mcuCandidates.length > 0 || pinMap.length > 0 || connectors.length > 0,
    phase: "Phase 10" as const,
    mcuCandidates,
    pinMap,
    peripherals,
    connectors,
    checklist,
    driverSuggestions,
    safetyNotes,
    bringUpSteps: buildBringUpSteps(),
    findings,
    limitations: [
      "Firmware Mode is guidance only and requires datasheet review.",
      "Firmware pin mapping is not guaranteed correct.",
      "No production-ready firmware or source code is generated.",
      "Schematic-to-Gerber validation, electrical validation, and Gerber geometry parsing are not complete."
    ],
    requiredFilesForStrongerValidation: [".kicad_sch", "Gerber/package evidence", "schematic symbol properties", "MCU datasheets", "connector pinout documentation"]
  };

  return {
    ...manualWithoutSummary,
    summary: summarizeFirmwareManual(project, manualWithoutSummary)
  };
}
