import type { MissingDataSeverity } from "../../../domain";
import type { ClassificationConfidence } from "../../intake/intakeTypes";

export type TableParserDiagnostic = Readonly<{
  severity: MissingDataSeverity;
  message: string;
  confidence: ClassificationConfidence;
  parserStage: "bom-parser" | "pick-and-place-parser";
  rowIndex?: number;
  columnName?: string;
}>;

export type ParsedDelimitedTable = Readonly<{
  headers: readonly string[];
  rows: readonly Readonly<Record<string, string>>[];
  delimiter: string;
  diagnostics: readonly TableParserDiagnostic[];
}>;

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function detectDelimiter(text: string): { delimiter: string; ambiguous: boolean } {
  const sample = text.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const candidates = [",", ";", "\t"];
  const counts = candidates.map((delimiter) => ({
    delimiter,
    count: splitDelimitedLine(sample, delimiter).length
  }));
  const sorted = counts.sort((a, b) => b.count - a.count);

  return {
    delimiter: sorted[0]?.count > 1 ? sorted[0].delimiter : ",",
    ambiguous: sorted.length > 1 && sorted[0].count === sorted[1].count
  };
}

export function parseDelimitedText(
  text: string,
  parserStage: "bom-parser" | "pick-and-place-parser"
): ParsedDelimitedTable {
  const diagnostics: TableParserDiagnostic[] = [];

  if (!text.trim()) {
    return {
      headers: [],
      rows: [],
      delimiter: ",",
      diagnostics: [
        {
          severity: "critical",
          message: "Delimited file is empty.",
          confidence: "direct",
          parserStage
        }
      ]
    };
  }

  const delimiterInfo = detectDelimiter(text);

  if (delimiterInfo.ambiguous) {
    diagnostics.push({
      severity: "low",
      message: "Delimiter detection was ambiguous; parser selected the most likely delimiter.",
      confidence: "inferred-low",
      parserStage
    });
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = splitDelimitedLine(lines[0] ?? "", delimiterInfo.delimiter).map(
    (header) => header.trim()
  );

  const rows = lines.slice(1).map((line) => {
    const cells = splitDelimitedLine(line, delimiterInfo.delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });

  return {
    headers,
    rows,
    delimiter: delimiterInfo.delimiter,
    diagnostics
  };
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
