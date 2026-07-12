import type { GerberX2ParseResult } from "./gerberAttributeTypes";
import type { GerberRawAttribute } from "./gerberAttributeTypes";

export type GerberParseStatus = "parsed" | "parsed-with-warnings" | "failed";

export type GerberUnits = "mm" | "inch";

export type GerberZeroSuppression = "leading" | "trailing" | "none" | "unknown";

export type GerberCoordinateMode = "absolute" | "incremental";

export type GerberInterpolationMode = "linear" | "clockwise-arc" | "counterclockwise-arc";

export type GerberQuadrantMode = "single" | "multi";

export type GerberPolarity = "dark" | "clear";

export type GerberCoordinateFormat = Readonly<{
  zeroSuppression: GerberZeroSuppression;
  coordinateMode: GerberCoordinateMode;
  xIntegerDigits: number;
  xDecimalDigits: number;
  yIntegerDigits: number;
  yDecimalDigits: number;
}>;

export type GerberPointMm = Readonly<{
  x: number;
  y: number;
}>;

export type GerberBoundingBoxMm = Readonly<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}>;

export type GerberApertureDefinition =
  | Readonly<{
      kind: "circle";
      code: number;
      diameterMm: number;
      holeDiameterMm?: number;
      apertureAttributeSetId?: string;
    }>
  | Readonly<{
      kind: "rectangle";
      code: number;
      widthMm: number;
      heightMm: number;
      holeDiameterMm?: number;
      apertureAttributeSetId?: string;
    }>
  | Readonly<{
      kind: "obround";
      code: number;
      widthMm: number;
      heightMm: number;
      holeDiameterMm?: number;
      apertureAttributeSetId?: string;
    }>
  | Readonly<{
      kind: "polygon";
      code: number;
      outerDiameterMm: number;
      vertices: number;
      rotationDeg: number;
      holeDiameterMm?: number;
      apertureAttributeSetId?: string;
    }>
  | Readonly<{
      kind: "macro";
      code: number;
      macroName: string;
      modifiers: number[];
      supported: false;
      apertureAttributeSetId?: string;
    }>;

export type GerberLinePrimitive = Readonly<{
  kind: "line";
  start: GerberPointMm;
  end: GerberPointMm;
  apertureCode: number;
  polarity: GerberPolarity;
  sourceBlock: number;
  objectAttributeSetId?: string;
}>;

export type GerberArcPrimitive = Readonly<{
  kind: "arc";
  start: GerberPointMm;
  end: GerberPointMm;
  center: GerberPointMm;
  clockwise: boolean;
  apertureCode: number;
  polarity: GerberPolarity;
  sourceBlock: number;
  objectAttributeSetId?: string;
}>;

export type GerberFlashPrimitive = Readonly<{
  kind: "flash";
  position: GerberPointMm;
  apertureCode: number;
  polarity: GerberPolarity;
  sourceBlock: number;
  objectAttributeSetId?: string;
}>;

export type GerberRegionSegment =
  | Readonly<{
      kind: "line";
      start: GerberPointMm;
      end: GerberPointMm;
      sourceBlock: number;
    }>
  | Readonly<{
      kind: "arc";
      start: GerberPointMm;
      end: GerberPointMm;
      center: GerberPointMm;
      clockwise: boolean;
      sourceBlock: number;
    }>;

export type GerberRegionContour = Readonly<{
  segments: readonly GerberRegionSegment[];
}>;

export type GerberRegionPrimitive = Readonly<{
  kind: "region";
  contours: readonly GerberRegionContour[];
  polarity: GerberPolarity;
  sourceBlockStart: number;
  sourceBlockEnd: number;
  objectAttributeSetId?: string;
}>;

export type GerberGeometryPrimitive =
  | GerberLinePrimitive
  | GerberArcPrimitive
  | GerberFlashPrimitive
  | GerberRegionPrimitive;

export type GerberGeometryCoverage =
  | "complete-for-supported-features"
  | "partial"
  | "unavailable";

export type GerberDiagnosticSeverity = "error" | "warning" | "info";

export type GerberDiagnostic = Readonly<{
  code: string;
  severity: GerberDiagnosticSeverity;
  message: string;
  sourceBlock?: number;
  rawStatement?: string;
}>;

export type GerberParseResult = Readonly<{
  sourceFileId: string;
  sourceFileName: string;
  sourceKind: "direct-upload" | "gerber-package-entry";
  sourcePackageId?: string;
  sourcePackageName?: string;
  sourceRelativePath?: string;
  status: GerberParseStatus;
  units: GerberUnits | null;
  coordinateFormat: GerberCoordinateFormat | null;
  apertures: readonly GerberApertureDefinition[];
  primitives: readonly GerberGeometryPrimitive[];
  boundsMm: GerberBoundingBoxMm | null;
  geometryCoverage: GerberGeometryCoverage;
  summary: {
    blockCount: number;
    apertureCount: number;
    lineCount: number;
    arcCount: number;
    flashCount: number;
    regionCount: number;
    darkPrimitiveCount: number;
    clearPrimitiveCount: number;
    x2AttributeCount: number;
    unsupportedMacroCount: number;
  };
  x2: GerberX2ParseResult;
  diagnostics: readonly GerberDiagnostic[];
}>;

export type GerberParserState = {
  units: GerberUnits | null;
  format: GerberCoordinateFormat | null;
  interpolation: GerberInterpolationMode;
  quadrantMode: GerberQuadrantMode;
  polarity: GerberPolarity;
  currentApertureCode: number | null;
  currentPointMm: GerberPointMm | null;
  modalOperation: "draw" | "move" | "flash" | null;
  regionActive: boolean;
  currentRegionContours: GerberRegionContour[];
  currentRegionStartBlock: number | null;
  currentRegionObjectAttributeSetId?: string;
  fileAttributes: Map<string, GerberRawAttribute>;
  activeApertureAttributes: Map<string, GerberRawAttribute>;
  activeObjectAttributes: Map<string, GerberRawAttribute>;
};

export const GERBER_PARSER_LIMITS = {
  maxSourceBytes: 50 * 1024 * 1024,
  maxBlocks: 2_000_000,
  maxApertures: 10_000,
  maxPrimitives: 2_000_000,
  maxDiagnostics: 5_000
} as const;
