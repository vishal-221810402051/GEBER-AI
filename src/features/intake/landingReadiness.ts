import type { ClassifiedFile, FileCategory } from "./intakeTypes";
import type { PublicProjectMode } from "./publicModeAdapter";

export type LandingReadinessTone = "success" | "warning" | "neutral";

export type LandingReadinessItem = Readonly<{
  label: string;
  detail: string;
  tone: LandingReadinessTone;
}>;

export type LandingReadiness = Readonly<{
  mode: PublicProjectMode;
  canStart: boolean;
  actionLabel: string;
  actionTarget: "/reports" | "/firmware";
  missingRequirement?: string;
  hasSchematic: boolean;
  hasManufacturingEvidence: boolean;
  hasNativePcb: boolean;
  hasBomOrPlacement: boolean;
  items: readonly LandingReadinessItem[];
  notices: readonly string[];
}>;

const manufacturingCategories: readonly FileCategory[] = [
  "gerber",
  "gerber-x2",
  "drill",
  "archive"
];

function hasCategory(files: readonly ClassifiedFile[], categories: readonly FileCategory[]) {
  return files.some((file) => categories.includes(file.category));
}

export function buildLandingReadiness(
  mode: PublicProjectMode,
  files: readonly ClassifiedFile[]
): LandingReadiness {
  const hasSchematic = hasCategory(files, ["kicad-schematic"]);
  const hasManufacturingEvidence = hasCategory(files, manufacturingCategories);
  const hasNativePcb = hasCategory(files, ["kicad-pcb"]);
  const hasBomOrPlacement = hasCategory(files, ["bom", "pick-and-place"]);
  const hasIpc = hasCategory(files, ["ipc-netlist"]);

  if (mode === "firmware") {
    return {
      mode,
      canStart: hasSchematic,
      actionLabel: "Build firmware document",
      actionTarget: "/firmware",
      missingRequirement: hasSchematic
        ? undefined
        : "Upload at least one KiCad schematic file to build firmware guidance.",
      hasSchematic,
      hasManufacturingEvidence,
      hasNativePcb,
      hasBomOrPlacement,
      items: [
        {
          label: "Schematic evidence",
          detail: hasSchematic
            ? "Available for symbols, labels, pins, sheets, and firmware evidence."
            : "Required for useful firmware guidance.",
          tone: hasSchematic ? "success" : "warning"
        },
        {
          label: "Native PCB",
          detail: hasNativePcb
            ? "Parsed native board evidence can improve pad and net context."
            : "Recommended for stronger pin and pad context.",
          tone: hasNativePcb ? "success" : "neutral"
        },
        {
          label: "Manufacturing files",
          detail: hasManufacturingEvidence
            ? "Detected, but not geometry-parsed in Phase B."
            : "Optional for firmware mode.",
          tone: hasManufacturingEvidence ? "warning" : "neutral"
        }
      ],
      notices: [
        "Firmware mappings remain evidence-based and must be checked against the datasheet and board."
      ]
    };
  }

  return {
    mode,
    canStart: hasSchematic && hasManufacturingEvidence,
    actionLabel: "Process inspection",
    actionTarget: "/reports",
    missingRequirement: !hasSchematic
      ? "Upload at least one KiCad schematic file."
      : !hasManufacturingEvidence
        ? "Upload at least one Gerber, drill, or manufacturing-package file."
        : undefined,
    hasSchematic,
    hasManufacturingEvidence,
    hasNativePcb,
    hasBomOrPlacement,
    items: [
      {
        label: "Schematic evidence",
        detail: hasSchematic
          ? "Available for symbols, pins, labels, nets, sheets, and logical evidence."
          : "Required for the Inspect workflow.",
        tone: hasSchematic ? "success" : "warning"
      },
      {
        label: "Gerber/manufacturing evidence",
        detail: hasManufacturingEvidence
          ? "Detected. Geometry analysis is not implemented yet."
          : "Required as file-presence evidence for the Inspect workflow.",
        tone: hasManufacturingEvidence ? "warning" : "warning"
      },
      {
        label: "Native PCB",
        detail: hasNativePcb
          ? "Parsed native board evidence is available for stronger inspection."
          : "Optional, but currently the strongest physical board evidence.",
        tone: hasNativePcb ? "success" : "neutral"
      },
      {
        label: "BOM / placement / IPC",
        detail: hasBomOrPlacement || hasIpc
          ? "Optional advanced evidence detected."
          : "Optional advanced evidence can improve context.",
        tone: hasBomOrPlacement || hasIpc ? "success" : "neutral"
      }
    ],
    notices: hasManufacturingEvidence
      ? ["Gerber files detected. Geometry analysis is not implemented yet."]
      : []
  };
}
