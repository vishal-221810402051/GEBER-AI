import type { ExportResult } from "./exportTypes";

export function downloadTextFile(filename: string, content: string, mimeType: string): ExportResult {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return { ok: true, message: `Export generated from current parsed data: ${filename}` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `Export failed: ${error.message}` : "Export failed."
    };
  }
}
