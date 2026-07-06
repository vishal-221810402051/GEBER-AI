export type UnitSystem = "metric" | "imperial" | "unknown";

export type SourceFileKind =
  | "gerber"
  | "drill"
  | "bom"
  | "placement"
  | "schematic"
  | "netlist"
  | "firmware"
  | "archive"
  | "unknown";

export type SeverityLevel = "info" | "warning" | "error" | "critical";

export type ConfidenceLevel = "low" | "medium" | "high" | "verified";

export type LayerKind =
  | "copper"
  | "soldermask"
  | "silkscreen"
  | "paste"
  | "mechanical"
  | "drill"
  | "documentation"
  | "unknown";

export type Point2D = Readonly<{
  x: number;
  y: number;
  unit: UnitSystem;
}>;

export type UploadedFile = Readonly<{
  id: string;
  name: string;
  sizeBytes: number;
  mimeType?: string;
  extension?: string;
  uploadedAt: string;
  checksum?: string;
}>;

export type SourceFile = Readonly<{
  id: string;
  file: UploadedFile;
  kind: SourceFileKind;
  role?: string;
}>;

export type PcbProject = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceFiles: readonly SourceFile[];
  units: UnitSystem;
  layers: readonly Layer[];
  nets: readonly Net[];
  components: readonly Component[];
  bomItems: readonly BomItem[];
  placementItems: readonly PlacementItem[];
  powerRails: readonly PowerRail[];
  firmwarePinMaps: readonly FirmwarePinMap[];
  analysisIssues: readonly AnalysisIssue[];
  reports: readonly EngineeringReport[];
}>;

export type Layer = Readonly<{
  id: string;
  name: string;
  kind: LayerKind;
  order?: number;
  side?: "top" | "bottom" | "inner" | "none";
}>;

export type Net = Readonly<{
  id: string;
  name: string;
  pins: readonly string[];
  isPower?: boolean;
}>;

export type Component = Readonly<{
  id: string;
  reference: string;
  value?: string;
  footprint?: string;
  manufacturerPartNumber?: string;
  pins: readonly Pin[];
}>;

export type Pin = Readonly<{
  id: string;
  number: string;
  name?: string;
  netId?: string;
  position?: Point2D;
}>;

export type Pad = Readonly<{
  id: string;
  layerId: string;
  netId?: string;
  componentId?: string;
  position: Point2D;
  shape?: "circle" | "rectangle" | "rounded-rectangle" | "oval" | "custom";
  width?: number;
  height?: number;
}>;

export type Track = Readonly<{
  id: string;
  layerId: string;
  netId?: string;
  start: Point2D;
  end: Point2D;
  width: number;
}>;

export type Via = Readonly<{
  id: string;
  netId?: string;
  position: Point2D;
  diameter: number;
  drillDiameter?: number;
  fromLayerId?: string;
  toLayerId?: string;
}>;

export type DrillHole = Readonly<{
  id: string;
  position: Point2D;
  diameter: number;
  plated?: boolean;
  netId?: string;
}>;

export type BomItem = Readonly<{
  id: string;
  references: readonly string[];
  quantity: number;
  value?: string;
  footprint?: string;
  manufacturerPartNumber?: string;
  supplierPartNumber?: string;
}>;

export type PlacementItem = Readonly<{
  id: string;
  componentId: string;
  reference: string;
  layerId?: string;
  position: Point2D;
  rotationDegrees?: number;
}>;

export type PowerRail = Readonly<{
  id: string;
  name: string;
  nominalVoltage?: number;
  netIds: readonly string[];
}>;

export type AnalysisIssueCategory =
  | "connectivity"
  | "clearance"
  | "manufacturing"
  | "bom"
  | "placement"
  | "power"
  | "firmware"
  | "documentation"
  | "unknown";

export type AnalysisIssue = Readonly<{
  id: string;
  category: AnalysisIssueCategory;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  title: string;
  description: string;
  sourceIds: readonly string[];
}>;

export type FirmwarePinMap = Readonly<{
  id: string;
  sourceFileId?: string;
  controllerName?: string;
  assignments: readonly FirmwarePinAssignment[];
}>;

export type FirmwarePinAssignment = Readonly<{
  id: string;
  firmwarePin: string;
  signalName?: string;
  netId?: string;
  componentPinId?: string;
  confidence: ConfidenceLevel;
}>;

export type EngineeringReport = Readonly<{
  id: string;
  title: string;
  generatedAt: string;
  sourceProjectId: string;
  issueIds: readonly string[];
  format: "markdown" | "html" | "pdf" | "json";
}>;

export type ParserConcern = Readonly<{
  inputKinds: readonly SourceFileKind[];
  outputContract: "source-files-to-normalized-project-data";
}>;

export type NormalizationConcern = Readonly<{
  inputContract: "parser-specific-records";
  outputContract: "pcb-project-domain-model";
}>;

export type ReportingConcern = Readonly<{
  inputContract: "pcb-project-and-analysis-issues";
  outputContract: "engineering-report";
}>;

export type ExportConcern = Readonly<{
  inputContract: "project-data-or-report";
  outputContract: "downloadable-artifact";
}>;
