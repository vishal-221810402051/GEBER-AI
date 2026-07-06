export type FileCategory =
  | "kicad-schematic"
  | "kicad-pcb"
  | "kicad-project"
  | "gerber"
  | "gerber-x2"
  | "drill"
  | "ipc-netlist"
  | "bom"
  | "pick-and-place"
  | "easyeda-export"
  | "archive"
  | "structured-table"
  | "unknown";

export type ClassificationConfidence =
  | "direct"
  | "inferred-high"
  | "inferred-medium"
  | "inferred-low"
  | "missing-data";

export type AnalysisMode = "basic" | "analyze" | "firmware";

export type ClassifiedFile = Readonly<{
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  mimeType: string;
  extension: string;
  category: FileCategory;
  categoryLabel: string;
  confidence: ClassificationConfidence;
  completenessContribution: string;
  requiresParser: boolean;
  note: string;
}>;

export type CompletenessCategory = Readonly<{
  key:
    | "kicad-pcb"
    | "kicad-schematic"
    | "bom"
    | "pick-and-place"
    | "drill"
    | "gerber"
    | "ipc-netlist";
  label: string;
  weight: number;
  present: boolean;
  whyItMatters: string;
}>;

export type CompletenessSummary = Readonly<{
  score: number;
  readinessLabel: string;
  categories: readonly CompletenessCategory[];
  detectedCategories: readonly string[];
  missingCategories: readonly CompletenessCategory[];
  gerberOnlyLimitation: boolean;
}>;

export type IntakeState = Readonly<{
  files: readonly ClassifiedFile[];
  mode: AnalysisMode;
}>;
