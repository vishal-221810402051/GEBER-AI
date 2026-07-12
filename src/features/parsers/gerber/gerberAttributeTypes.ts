import type { GerberDiagnostic } from "./gerberTypes";

export type GerberAttributeScope = "file" | "aperture" | "object";

export type GerberAttributeCommandKind = "TF" | "TA" | "TO" | "TD";

export type GerberRawAttribute = Readonly<{
  scope: GerberAttributeScope;
  command: Exclude<GerberAttributeCommandKind, "TD">;
  name: string;
  normalizedName: string;
  values: readonly string[];
  sourceBlock: number;
  rawStatement?: string;
}>;

export type GerberAttributeDeletion = Readonly<{
  command: "TD";
  name: string | null;
  normalizedName: string | null;
  sourceBlock: number;
  rawStatement?: string;
}>;

export type GerberFileFunctionEvidence = Readonly<{
  rawFunction: string;
  rawModifiers: readonly string[];
  category:
    | "copper"
    | "solder-mask"
    | "legend"
    | "profile"
    | "paste"
    | "fabrication"
    | "assembly"
    | "other"
    | "unknown";
  side?: "top" | "bottom" | "inner";
  layerNumber?: number;
  confidence: "declared" | "filename-inferred" | "unknown";
  sourceBlock: number;
}>;

export type GerberFileAttributes = Readonly<{
  raw: readonly GerberRawAttribute[];
  fileFunction?: GerberFileFunctionEvidence;
  filePolarity?: {
    polarity: string;
    sourceBlock: number;
  };
  part?: {
    value: string;
    sourceBlock: number;
  };
  generationSoftware?: {
    vendor?: string;
    application?: string;
    version?: string;
    rawValues: readonly string[];
    sourceBlock: number;
  };
  creationDate?: {
    rawValue: string;
    parsedIsoValue?: string;
    sourceBlock: number;
  };
  projectId?: {
    rawValues: readonly string[];
    sourceBlock: number;
  };
  md5?: {
    value: string;
    sourceBlock: number;
  };
  sameCoordinates?: {
    identifier: string;
    sourceBlock: number;
  };
  unknown: readonly GerberRawAttribute[];
}>;

export type GerberApertureAttributes = Readonly<{
  raw: readonly GerberRawAttribute[];
  apertureFunction?: {
    value: string;
    modifiers: readonly string[];
    sourceBlock: number;
  };
  drillTolerance?: {
    plus?: number;
    minus?: number;
    rawValues: readonly string[];
    sourceBlock: number;
  };
  unknown: readonly GerberRawAttribute[];
}>;

export type GerberObjectAttributes = Readonly<{
  raw: readonly GerberRawAttribute[];
  net?: {
    name: string;
    sourceBlock: number;
  };
  pin?: {
    componentReference?: string;
    pinNumber?: string;
    rawValues: readonly string[];
    sourceBlock: number;
  };
  component?: {
    reference: string;
    rawValues: readonly string[];
    sourceBlock: number;
  };
  unknown: readonly GerberRawAttribute[];
}>;

export type GerberAttributeSetId = string;

export type GerberAttributeSet<TInterpreted = GerberObjectAttributes | GerberApertureAttributes> = Readonly<{
  id: GerberAttributeSetId;
  raw: readonly GerberRawAttribute[];
  interpreted: TInterpreted;
}>;

export type GerberX2Summary = Readonly<{
  commandCount: number;
  fileAttributeCount: number;
  apertureAttributeCount: number;
  objectAttributeCount: number;
  deletionCommandCount: number;
  unknownAttributeCount: number;
  malformedAttributeCount: number;
  attributedApertureCount: number;
  attributedPrimitiveCount: number;
  declaredNetCount: number;
  declaredComponentReferenceCount: number;
  declaredPinCount: number;
  hasFileFunction: boolean;
  hasApertureFunctions: boolean;
  hasNetMetadata: boolean;
  hasComponentMetadata: boolean;
  semanticCoverage: "none" | "partial" | "parsed";
}>;

export type GerberX2ParseResult = Readonly<{
  detected: boolean;
  fileAttributes: GerberFileAttributes;
  apertureAttributeSets: Readonly<Record<string, GerberAttributeSet<GerberApertureAttributes>>>;
  objectAttributeSets: Readonly<Record<string, GerberAttributeSet<GerberObjectAttributes>>>;
  summary: GerberX2Summary;
}>;

export type GerberProjectX2Summary = Readonly<{
  x2FileCount: number;
  x1FileCount: number;
  filesWithDeclaredFunction: number;
  filesWithNetMetadata: number;
  filesWithComponentMetadata: number;
  filesWithPinMetadata: number;
  declaredLayerFunctions: readonly {
    fileId: string;
    fileName: string;
    function: string;
    modifiers: readonly string[];
  }[];
  declaredNetNames: readonly string[];
  declaredComponentReferences: readonly string[];
  conflictingFileClassifications: readonly {
    fileId: string;
    fileName: string;
    declaredFunction: string;
    filenameInference?: string;
  }[];
}>;

export type GerberParsedAttributeCommand =
  | GerberRawAttribute
  | GerberAttributeDeletion;

export const GERBER_ATTRIBUTE_LIMITS = {
  maxAttributesPerFile: 100_000,
  maxValuesPerAttribute: 256,
  maxAttributeNameLength: 256,
  maxAttributeValueLength: 16_384,
  maxAttributeSetCount: 100_000
} as const;

export type GerberAttributeParserContext = Readonly<{
  sourceBlock: number;
  rawStatement: string;
  diagnostics: GerberDiagnostic[];
  maxDiagnostics: number;
}>;
