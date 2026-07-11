import type { ClassifiedFile, FileCategory } from "../intake/intakeTypes";

export const GERBER_PACKAGE_LIMITS = {
  maxCompressedBytes: 50 * 1024 * 1024,
  maxExtractedBytes: 150 * 1024 * 1024,
  maxEntries: 500,
  maxSingleEntryBytes: 50 * 1024 * 1024
} as const;

export type GerberPackageStatus =
  | "pending"
  | "extracting"
  | "ready"
  | "warning"
  | "error";

export type GerberPackageEntryStatus =
  | "gerber"
  | "auxiliary"
  | "ignored"
  | "unsafe"
  | "unsupported"
  | "error";

export type GerberPackageEntry = Readonly<{
  id: string;
  packageId: string;
  packageName: string;
  relativePath: string;
  fileName: string;
  size: number;
  status: GerberPackageEntryStatus;
  classification: string;
  extractedFileId?: string;
  diagnostic?: string;
}>;

export type GerberPackageRecord = Readonly<{
  id: string;
  fileName: string;
  compressedSize: number;
  extractedSize: number;
  status: GerberPackageStatus;
  entries: readonly GerberPackageEntry[];
  gerberEntryCount: number;
  ignoredEntryCount: number;
  warningCount: number;
  errorCount: number;
  diagnostics: readonly string[];
}>;

export type GerberPackageExtractionResult = Readonly<{
  record: GerberPackageRecord;
  gerberFiles: readonly ClassifiedFile[];
}>;

export type GerberPackageEntryClassification = Readonly<{
  status: GerberPackageEntryStatus;
  category: FileCategory;
  classification: string;
  diagnostic?: string;
}>;
