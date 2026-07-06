import type {
  ClassifiedFile,
  CompletenessCategory,
  CompletenessSummary
} from "./intakeTypes";

const categoryWeights: readonly Omit<CompletenessCategory, "present">[] = [
  {
    key: "kicad-pcb",
    label: "KiCad PCB file",
    weight: 25,
    whyItMatters: "Needed for board-level geometry, footprints, placement, and PCB-side evidence."
  },
  {
    key: "kicad-schematic",
    label: "KiCad schematic file",
    weight: 25,
    whyItMatters: "Needed for schematic intent, symbols, connectivity meaning, and firmware pin confidence."
  },
  {
    key: "bom",
    label: "BOM file",
    weight: 15,
    whyItMatters: "Needed for part grouping, quantities, manufacturer data, and procurement review."
  },
  {
    key: "pick-and-place",
    label: "Pick-and-place file",
    weight: 10,
    whyItMatters: "Needed for assembly-side placement and centroid validation."
  },
  {
    key: "drill",
    label: "Drill file",
    weight: 10,
    whyItMatters: "Needed for holes, vias, fabrication completeness, and manufacturing package review."
  },
  {
    key: "gerber",
    label: "Gerber files",
    weight: 10,
    whyItMatters: "Needed for manufacturing artwork, copper, mask, silkscreen, and outline evidence."
  },
  {
    key: "ipc-netlist",
    label: "IPC-356 netlist",
    weight: 5,
    whyItMatters: "Useful for independent manufacturing net connectivity evidence."
  }
];

function getReadinessLabel(score: number): string {
  if (score <= 20) {
    return "Insufficient";
  }

  if (score <= 45) {
    return "Basic manufacturing package only";
  }

  if (score <= 70) {
    return "Partial engineering package";
  }

  if (score <= 90) {
    return "Strong analysis package";
  }

  return "Complete analysis package";
}

function categoryIsPresent(files: readonly ClassifiedFile[], key: CompletenessCategory["key"]): boolean {
  if (key === "gerber") {
    return files.some((file) => file.category === "gerber" || file.category === "gerber-x2");
  }

  return files.some((file) => file.category === key);
}

export function calculateCompleteness(files: readonly ClassifiedFile[]): CompletenessSummary {
  const categories = categoryWeights.map((category) => ({
    ...category,
    present: categoryIsPresent(files, category.key)
  }));

  const score = categories.reduce(
    (total, category) => total + (category.present ? category.weight : 0),
    0
  );

  const detectedCategories = Array.from(
    new Set(files.map((file) => file.categoryLabel))
  ).sort();

  const usefulCategories = categories.filter((category) => category.present);
  const gerberOnlyLimitation =
    usefulCategories.length > 0 &&
    usefulCategories.every(
      (category) => category.key === "gerber" || category.key === "drill"
    );

  return {
    score,
    readinessLabel: getReadinessLabel(score),
    categories,
    detectedCategories,
    missingCategories: categories.filter((category) => !category.present),
    gerberOnlyLimitation
  };
}
