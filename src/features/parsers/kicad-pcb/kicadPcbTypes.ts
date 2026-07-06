import type { MissingDataSeverity } from "../../../domain";
import type { ClassificationConfidence } from "../../intake/intakeTypes";

export type KiCadPcbParserDiagnostic = Readonly<{
  severity: MissingDataSeverity;
  message: string;
  confidence: ClassificationConfidence;
  parserStage: "kicad-pcb-parser";
  location?: string;
}>;

export type KiCadPcbMetadata = Readonly<{
  version?: string;
  generator?: string;
  generatorVersion?: string;
  paper?: string;
  thickness?: number;
}>;

export type KiCadPcbLayer = Readonly<{
  id: string;
  name: string;
  type: string;
  function?: string;
}>;

export type KiCadPcbNet = Readonly<{
  id: string;
  name: string;
}>;

export type KiCadPcbPad = Readonly<{
  number: string;
  type?: string;
  shape?: string;
  x?: number;
  y?: number;
  sizeX?: number;
  sizeY?: number;
  drill?: number;
  layers: readonly string[];
  netId?: string;
  netName?: string;
}>;

export type KiCadPcbFootprint = Readonly<{
  reference?: string;
  value?: string;
  footprintName: string;
  layer?: string;
  x?: number;
  y?: number;
  rotation?: number;
  description?: string;
  tags?: string;
  properties: Readonly<Record<string, string>>;
  pads: readonly KiCadPcbPad[];
  padNetNames: readonly string[];
}>;

export type KiCadPcbTrackSegment = Readonly<{
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  width?: number;
  layer?: string;
  netId?: string;
}>;

export type KiCadPcbVia = Readonly<{
  x?: number;
  y?: number;
  size?: number;
  drill?: number;
  layers: readonly string[];
  netId?: string;
}>;

export type KiCadPcbZone = Readonly<{
  netId?: string;
  netName?: string;
  name?: string;
  layers: readonly string[];
}>;

export type KiCadPcbOutlinePrimitive = Readonly<{
  kind: "line" | "arc" | "rect" | "other";
  layer?: string;
  points: readonly { x: number; y: number }[];
}>;

export type KiCadPcbBoundingBox = Readonly<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  confidence: ClassificationConfidence;
}>;

export type KiCadPcbSummary = Readonly<{
  layerCount: number;
  copperLayerCount: number;
  netCount: number;
  footprintCount: number;
  padCount: number;
  trackSegmentCount: number;
  viaCount: number;
  zoneCount: number;
  edgeCutsPrimitiveCount: number;
  outlineStatus: "not-found" | "partial" | "estimated";
  boundingBox?: KiCadPcbBoundingBox;
}>;

export type KiCadPcbParseResult = Readonly<{
  success: boolean;
  sourceFileId: string;
  sourceFileName: string;
  metadata: KiCadPcbMetadata;
  layers: readonly KiCadPcbLayer[];
  nets: readonly KiCadPcbNet[];
  footprints: readonly KiCadPcbFootprint[];
  trackSegments: readonly KiCadPcbTrackSegment[];
  vias: readonly KiCadPcbVia[];
  zones: readonly KiCadPcbZone[];
  outlinePrimitives: readonly KiCadPcbOutlinePrimitive[];
  summary: KiCadPcbSummary;
  diagnostics: readonly KiCadPcbParserDiagnostic[];
}>;
