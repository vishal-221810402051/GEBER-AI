import type { ExportResult } from "./exportTypes";

export async function copyTextToClipboard(text: string): Promise<ExportResult> {
  try {
    if (!navigator.clipboard) {
      return { ok: false, message: "Clipboard API unavailable in this browser. Use Download MD instead." };
    }

    await navigator.clipboard.writeText(text);
    return { ok: true, message: "Markdown copied to clipboard." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `Clipboard copy failed: ${error.message}` : "Clipboard copy failed."
    };
  }
}
