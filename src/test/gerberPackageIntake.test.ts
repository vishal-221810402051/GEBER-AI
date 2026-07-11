import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildProjectInputPackage } from "../domain/workflow";
import {
  extractGerberPackage,
  GERBER_PACKAGE_LIMITS
} from "../features/gerber-package";
import { classifyFile } from "../features/intake/classifyFile";
import { groupFilesForDisplay } from "../features/intake/groupFilesForDisplay";
import { deriveWorkflowReadiness } from "../features/workflow";

const encoder = new TextEncoder();

function bytes(text: string) {
  return encoder.encode(text);
}

function zipFile(name: string, entries: Record<string, Uint8Array>): File {
  const data = zipSync(entries);
  return new File([new Uint8Array(data)], name, {
    type: "application/zip",
    lastModified: 1
  });
}

function centralOnlyZip(entries: readonly {
  name: string;
  compressedSize?: number;
  uncompressedSize?: number;
  method?: number;
  flags?: number;
}[]): Uint8Array {
  const nameBytes = entries.map((entry) => bytes(entry.name));
  const centralSize = entries.reduce((total, _entry, index) => total + 46 + nameBytes[index].length, 0);
  const data = new Uint8Array(centralSize + 22);
  const view = new DataView(data.buffer);
  let cursor = 0;

  entries.forEach((entry, index) => {
    const name = nameBytes[index];
    view.setUint32(cursor, 0x02014b50, true);
    view.setUint16(cursor + 8, entry.flags ?? 0, true);
    view.setUint16(cursor + 10, entry.method ?? 0, true);
    view.setUint32(cursor + 20, entry.compressedSize ?? 0, true);
    view.setUint32(cursor + 24, entry.uncompressedSize ?? 0, true);
    view.setUint16(cursor + 28, name.length, true);
    data.set(name, cursor + 46);
    cursor += 46 + name.length;
  });

  view.setUint32(cursor, 0x06054b50, true);
  view.setUint16(cursor + 8, entries.length, true);
  view.setUint16(cursor + 10, entries.length, true);
  view.setUint32(cursor + 12, centralSize, true);
  view.setUint32(cursor + 16, 0, true);

  return data;
}

function centralOnlyFile(name: string, entries: Parameters<typeof centralOnlyZip>[0]) {
  return new File([new Uint8Array(centralOnlyZip(entries))], name, {
    type: "application/zip",
    lastModified: 1
  });
}

function emptyResults() {
  return {
      bomResults: {},
      gerberParserResults: {},
      kicadPcbResults: {},
      kicadSchematicResults: {},
      placementResults: {}
  };
}

describe("Gerber package intake", () => {
  it("extracts a valid ZIP containing one Gerber file", async () => {
    const result = await extractGerberPackage(zipFile("gerbers.zip", {
      "top.gtl": bytes("G04 top*")
    }));

    expect(result.record.status).toBe("ready");
    expect(result.record.gerberEntryCount).toBe(1);
    expect(result.gerberFiles).toHaveLength(1);
    expect(result.gerberFiles[0].category).toBe("gerber");
    expect(result.gerberFiles[0].sourceKind).toBe("gerber-package-entry");
    expect(result.gerberFiles[0].sourceRelativePath).toBe("top.gtl");
  });

  it("extracts several Gerber files from nested directories", async () => {
    const result = await extractGerberPackage(zipFile("nested.zip", {
      "fab/top.gtl": bytes("G04 top*"),
      "fab/bottom.gbl": bytes("G04 bottom*")
    }));

    expect(result.record.gerberEntryCount).toBe(2);
    expect(result.gerberFiles.map((file) => file.sourceRelativePath).sort()).toEqual([
      "fab/bottom.gbl",
      "fab/top.gtl"
    ]);
  });

  it("keeps documents and drill files out of canonical Gerber evidence", async () => {
    const result = await extractGerberPackage(zipFile("mixed.zip", {
      "top.gtl": bytes("G04 top*"),
      "board.drl": bytes("M48"),
      "README.txt": bytes("notes"),
      "bom.csv": bytes("Reference,Value")
    }));

    expect(result.record.status).toBe("warning");
    expect(result.record.gerberEntryCount).toBe(1);
    expect(result.record.ignoredEntryCount).toBe(3);
    expect(result.gerberFiles).toHaveLength(1);
  });

  it("does not satisfy readiness for ZIP packages with only drill files", async () => {
    const result = await extractGerberPackage(zipFile("drill-only.zip", {
      "board.drl": bytes("M48")
    }));
    const inputPackage = buildProjectInputPackage([
      classifyFile(new File([""], "main.kicad_sch")),
      ...result.gerberFiles
    ]);

    expect(result.record.gerberEntryCount).toBe(0);
    expect(deriveWorkflowReadiness("inspect", inputPackage).ready).toBe(false);
  });

  it("reports empty and corrupt ZIP packages", async () => {
    const empty = await extractGerberPackage(zipFile("empty.zip", {}));
    const corrupt = await extractGerberPackage(new File([bytes("not a zip")], "bad.zip"));

    expect(empty.record.status).toBe("error");
    expect(corrupt.record.status).toBe("error");
    expect(corrupt.record.diagnostics[0]).toContain("Invalid");
  });

  it("rejects unsafe relative and absolute paths", async () => {
    const traversal = await extractGerberPackage(centralOnlyFile("unsafe.zip", [
      { name: "../top.gtl", uncompressedSize: 10 }
    ]));
    const absolute = await extractGerberPackage(centralOnlyFile("absolute.zip", [
      { name: "C:/temp/top.gtl", uncompressedSize: 10 }
    ]));

    expect(traversal.record.entries[0].status).toBe("unsafe");
    expect(absolute.record.entries[0].status).toBe("unsafe");
  });

  it("handles entry count and extracted-size safety limits", async () => {
    const excessiveCountData = new Uint8Array(22);
    const view = new DataView(excessiveCountData.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, GERBER_PACKAGE_LIMITS.maxEntries + 1, true);
    view.setUint16(10, GERBER_PACKAGE_LIMITS.maxEntries + 1, true);

    const excessiveCount = await extractGerberPackage(new File([excessiveCountData], "many.zip"));
    const excessiveSize = await extractGerberPackage(centralOnlyFile("huge.zip", [
      { name: "top.gtl", uncompressedSize: GERBER_PACKAGE_LIMITS.maxExtractedBytes + 1 }
    ]));
    const oversizedEntry = await extractGerberPackage(centralOnlyFile("single-huge.zip", [
      { name: "top.gtl", uncompressedSize: GERBER_PACKAGE_LIMITS.maxSingleEntryBytes + 1 }
    ]));

    expect(excessiveCount.record.status).toBe("error");
    expect(excessiveSize.record.status).toBe("error");
    expect(oversizedEntry.record.entries[0].classification).toBe("Oversized entry");
  });

  it("does not recursively extract nested ZIP archives", async () => {
    const inner = zipSync({ "inner.gtl": bytes("G04 inner*") });
    const result = await extractGerberPackage(zipFile("nested-archive.zip", {
      "inner.zip": inner
    }));

    expect(result.record.gerberEntryCount).toBe(0);
    expect(result.record.entries[0].status).toBe("unsupported");
  });

  it("reports duplicate paths deterministically", async () => {
    const result = await extractGerberPackage(centralOnlyFile("duplicate.zip", [
      { name: "notes.txt", uncompressedSize: 1 },
      { name: "notes.txt", uncompressedSize: 1 }
    ]));

    expect(result.record.entries.some((entry) => entry.classification === "Duplicate path")).toBe(true);
  });

  it("marks extracted Gerbers as recognized until geometry parsing finishes", async () => {
    const result = await extractGerberPackage(zipFile("gerbers.zip", {
      "top.gtl": bytes("G04 top*")
    }));
    const groups = groupFilesForDisplay(result.gerberFiles, emptyResults());
    const gerber = groups.flatMap((group) => group.files).find((file) => file.file.category === "gerber");

    expect(gerber?.status).toBe("recognized");
    expect(gerber?.statusLabel).toBe("Recognized");
    expect(gerber?.summaryItems).toContain("Geometry parser pending");
  });
});
