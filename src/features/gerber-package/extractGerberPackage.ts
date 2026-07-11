import { unzipSync } from "fflate";
import { classifyFile } from "../intake/classifyFile";
import type { ClassifiedFile } from "../intake/intakeTypes";
import { classifyGerberPackageEntry } from "./classifyGerberPackageEntry";
import {
  GERBER_PACKAGE_LIMITS,
  type GerberPackageEntry,
  type GerberPackageExtractionResult,
  type GerberPackageStatus
} from "./gerberPackageTypes";

type CentralDirectoryEntry = Readonly<{
  rawPath: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  encrypted: boolean;
}>;

const decoder = new TextDecoder();
const eocdSignature = 0x06054b50;
const centralDirectorySignature = 0x02014b50;

function packageIdFor(file: File) {
  return `package:${file.name}:${file.size}:${file.lastModified}`;
}

function readUint16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readUint32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function findEndOfCentralDirectory(view: DataView) {
  const minOffset = Math.max(0, view.byteLength - 65_557);

  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (readUint32(view, offset) === eocdSignature) {
      return offset;
    }
  }

  return -1;
}

function parseCentralDirectory(data: Uint8Array): readonly CentralDirectoryEntry[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);

  if (eocdOffset < 0) {
    throw new Error("Invalid or corrupt ZIP package.");
  }

  const entryCount = readUint16(view, eocdOffset + 10);
  const centralDirectorySize = readUint32(view, eocdOffset + 12);
  const centralDirectoryOffset = readUint32(view, eocdOffset + 16);

  if (entryCount === 0xffff || centralDirectoryOffset === 0xffffffff || centralDirectorySize === 0xffffffff) {
    throw new Error("ZIP64 packages are not supported in this browser intake phase.");
  }

  if (entryCount > GERBER_PACKAGE_LIMITS.maxEntries) {
    throw new Error(`ZIP package has ${entryCount} entries; the limit is ${GERBER_PACKAGE_LIMITS.maxEntries}.`);
  }

  if (centralDirectoryOffset + centralDirectorySize > data.byteLength) {
    throw new Error("ZIP central directory is outside the package bounds.");
  }

  const entries: CentralDirectoryEntry[] = [];
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > data.byteLength || readUint32(view, cursor) !== centralDirectorySignature) {
      throw new Error("ZIP central directory entry is corrupt.");
    }

    const flags = readUint16(view, cursor + 8);
    const compressionMethod = readUint16(view, cursor + 10);
    const compressedSize = readUint32(view, cursor + 20);
    const uncompressedSize = readUint32(view, cursor + 24);
    const fileNameLength = readUint16(view, cursor + 28);
    const extraLength = readUint16(view, cursor + 30);
    const commentLength = readUint16(view, cursor + 32);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + fileNameLength;

    if (nameEnd > data.byteLength) {
      throw new Error("ZIP entry name is outside the package bounds.");
    }

    entries.push({
      rawPath: decoder.decode(data.subarray(nameStart, nameEnd)),
      compressedSize,
      uncompressedSize,
      compressionMethod,
      encrypted: Boolean(flags & 1)
    });

    cursor = nameEnd + extraLength + commentLength;
  }

  return entries;
}

function normalizeEntryPath(rawPath: string): { safePath?: string; diagnostic?: string } {
  const path = rawPath.replace(/\\/g, "/").trim();

  if (!path || path.includes("\0")) {
    return { diagnostic: "Entry path is empty or contains unsafe characters." };
  }

  if (path.startsWith("/") || /^[a-zA-Z]:/.test(path)) {
    return { diagnostic: "Absolute ZIP entry paths are not accepted." };
  }

  const segments = path.split("/").filter((segment) => segment.length > 0 && segment !== ".");

  if (segments.some((segment) => segment === "..")) {
    return { diagnostic: "Path traversal segments are not accepted." };
  }

  return { safePath: segments.join("/") };
}

function fileNameFromPath(relativePath: string) {
  return relativePath.split("/").at(-1) || relativePath;
}

function baseEntry(input: {
  packageId: string;
  packageName: string;
  relativePath: string;
  size: number;
  status: GerberPackageEntry["status"];
  classification: string;
  diagnostic?: string;
  extractedFileId?: string;
}): GerberPackageEntry {
  return {
    id: `${input.packageId}:${input.relativePath}`,
    packageId: input.packageId,
    packageName: input.packageName,
    relativePath: input.relativePath,
    fileName: fileNameFromPath(input.relativePath),
    size: input.size,
    status: input.status,
    classification: input.classification,
    diagnostic: input.diagnostic,
    extractedFileId: input.extractedFileId
  };
}

function errorResult(file: File, message: string): GerberPackageExtractionResult {
  const packageId = packageIdFor(file);
  return {
    record: {
      id: packageId,
      fileName: file.name,
      compressedSize: file.size,
      extractedSize: 0,
      status: "error",
      entries: [],
      gerberEntryCount: 0,
      ignoredEntryCount: 0,
      warningCount: 0,
      errorCount: 1,
      diagnostics: [message]
    },
    gerberFiles: []
  };
}

function statusForCounts(gerberCount: number, warningCount: number, errorCount: number): GerberPackageStatus {
  if (gerberCount === 0 && errorCount > 0) return "error";
  if (warningCount > 0 || errorCount > 0 || gerberCount === 0) return "warning";
  return "ready";
}

export async function extractGerberPackage(file: File): Promise<GerberPackageExtractionResult> {
  const packageId = packageIdFor(file);

  if (file.size > GERBER_PACKAGE_LIMITS.maxCompressedBytes) {
    return errorResult(file, `Package is larger than ${GERBER_PACKAGE_LIMITS.maxCompressedBytes} bytes.`);
  }

  let data: Uint8Array;
  try {
    data = new Uint8Array(await file.arrayBuffer());
  } catch {
    return errorResult(file, "Package could not be read in the browser.");
  }

  let centralEntries: readonly CentralDirectoryEntry[];
  try {
    centralEntries = parseCentralDirectory(data);
  } catch (error) {
    return errorResult(file, error instanceof Error ? error.message : "Invalid ZIP package.");
  }

  if (centralEntries.length === 0) {
    return errorResult(file, "ZIP package is empty.");
  }

  const entries: GerberPackageEntry[] = [];
  const allowedRawPaths = new Set<string>();
  const firstRawPathForSafePath = new Map<string, string>();
  const safePathCounts = new Map<string, number>();
  let extractedSize = 0;
  let extractedSizeExceeded = false;

  centralEntries.forEach((entry) => {
    const normalized = normalizeEntryPath(entry.rawPath);
    const displayPath = normalized.safePath ?? entry.rawPath.replace(/\\/g, "/");

    if (!normalized.safePath) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: displayPath || "(unsafe entry)",
        size: entry.uncompressedSize,
        status: "unsafe",
        classification: "Unsafe path",
        diagnostic: normalized.diagnostic
      }));
      return;
    }

    const isDirectory = entry.rawPath.endsWith("/") || normalized.safePath.endsWith("/");
    if (isDirectory) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: 0,
        status: "ignored",
        classification: "Directory",
        diagnostic: "Directory entries are ignored."
      }));
      return;
    }

    const duplicateCount = safePathCounts.get(normalized.safePath) ?? 0;
    safePathCounts.set(normalized.safePath, duplicateCount + 1);
    if (duplicateCount > 0) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: entry.uncompressedSize,
        status: "error",
        classification: "Duplicate path",
        diagnostic: "Duplicate entry path ignored; package entries must be unambiguous."
      }));
      return;
    }

    firstRawPathForSafePath.set(normalized.safePath, entry.rawPath);

    if (entry.encrypted) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: entry.uncompressedSize,
        status: "error",
        classification: "Encrypted entry",
        diagnostic: "Encrypted ZIP entries are not supported."
      }));
      return;
    }

    if (entry.compressionMethod !== 0 && entry.compressionMethod !== 8) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: entry.uncompressedSize,
        status: "unsupported",
        classification: `Compression method ${entry.compressionMethod}`,
        diagnostic: "Entry compression method is not supported."
      }));
      return;
    }

    if (entry.uncompressedSize > GERBER_PACKAGE_LIMITS.maxSingleEntryBytes) {
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: entry.uncompressedSize,
        status: "error",
        classification: "Oversized entry",
        diagnostic: `Entry is larger than ${GERBER_PACKAGE_LIMITS.maxSingleEntryBytes} bytes.`
      }));
      return;
    }

    extractedSize += entry.uncompressedSize;
    if (extractedSize > GERBER_PACKAGE_LIMITS.maxExtractedBytes) {
      extractedSizeExceeded = true;
      entries.push(baseEntry({
        packageId,
        packageName: file.name,
        relativePath: normalized.safePath,
        size: entry.uncompressedSize,
        status: "error",
        classification: "Extracted size limit",
        diagnostic: `Extracted package size exceeds ${GERBER_PACKAGE_LIMITS.maxExtractedBytes} bytes.`
      }));
      return;
    }

    const classification = classifyGerberPackageEntry(fileNameFromPath(normalized.safePath));
    const extractedFileId = classification.status === "gerber"
      ? `${packageId}:${normalized.safePath}`
      : undefined;

    if (classification.status === "gerber") {
      allowedRawPaths.add(entry.rawPath);
    }

    entries.push(baseEntry({
      packageId,
      packageName: file.name,
      relativePath: normalized.safePath,
      size: entry.uncompressedSize,
      status: classification.status,
      classification: classification.classification,
      diagnostic: classification.diagnostic,
      extractedFileId
    }));
  });

  let unzipped: Record<string, Uint8Array> = {};
  if (allowedRawPaths.size > 0 && !extractedSizeExceeded) {
    try {
      unzipped = unzipSync(data, {
        filter: (entry) => allowedRawPaths.has(entry.name)
      });
    } catch {
      return errorResult(file, "Package could not be extracted. It may be corrupt or use unsupported ZIP features.");
    }
  }

  const gerberFiles: ClassifiedFile[] = entries
    .filter((entry) => entry.status === "gerber" && entry.extractedFileId)
    .map((entry) => {
      const rawPath = firstRawPathForSafePath.get(entry.relativePath) ?? entry.relativePath;
      const bytes = unzipped[rawPath];
      const virtualFile = new File([new Uint8Array(bytes ?? [])], entry.fileName, {
        type: "application/octet-stream",
        lastModified: file.lastModified
      });

      return classifyFile(virtualFile, {
        id: entry.extractedFileId,
        sourceKind: "gerber-package-entry",
        sourcePackageId: packageId,
        sourcePackageName: file.name,
        sourceRelativePath: entry.relativePath
      });
    });

  const gerberEntryCount = gerberFiles.length;
  const errorCount = entries.filter((entry) => entry.status === "error" || entry.status === "unsafe").length + (extractedSizeExceeded ? 1 : 0);
  const ignoredEntryCount = entries.filter((entry) => entry.status !== "gerber").length;
  const warningCount = entries.filter((entry) => entry.status === "auxiliary" || entry.status === "ignored" || entry.status === "unsupported").length;
  const diagnostics = [
    ...entries.map((entry) => entry.diagnostic).filter(Boolean),
    gerberEntryCount === 0 ? "The package was opened, but no supported Gerber files were detected." : undefined
  ].filter(Boolean) as string[];

  return {
    record: {
      id: packageId,
      fileName: file.name,
      compressedSize: file.size,
      extractedSize,
      status: statusForCounts(gerberEntryCount, warningCount, errorCount),
      entries,
      gerberEntryCount,
      ignoredEntryCount,
      warningCount: warningCount + (gerberEntryCount === 0 ? 1 : 0),
      errorCount,
      diagnostics
    },
    gerberFiles
  };
}
