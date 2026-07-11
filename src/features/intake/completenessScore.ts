import type {
  ClassifiedFile,
  CompletenessCategory,
  CompletenessSummary
} from "./intakeTypes";

const categoryWeights: readonly Omit<CompletenessCategory, "present">[] = [
  {
    key: "kicad-schematic",
    label: "KiCad schematic file",
    weight: 50,
    whyItMatters: "Needed for schematic intent, symbols, connectivity meaning, and firmware pin confidence."
  },
  {
    key: "gerber",
    label: "Gerber/package files",
    weight: 50,
    whyItMatters: "Needed as the canonical physical/manufacturing evidence input. Geometry parsing is deferred."
  }
];

function getReadinessLabel(score: number): string {
  if (score === 0) {
    return "Insufficient";
  }

  if (score < 100) {
    return "Partial canonical package";
  }

  return "Complete canonical package";
}

function categoryIsPresent(files: readonly ClassifiedFile[], key: CompletenessCategory["key"]): boolean {
  if (key === "gerber") {
    return files.some((file) =>
      file.category === "gerber" ||
      file.category === "gerber-x2" ||
      file.category === "archive"
    );
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
    usefulCategories.every((category) => category.key === "gerber");

  return {
    score,
    readinessLabel: getReadinessLabel(score),
    categories,
    detectedCategories,
    missingCategories: categories.filter((category) => !category.present),
    gerberOnlyLimitation
  };
}
