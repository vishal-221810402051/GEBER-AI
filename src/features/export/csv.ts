import type { ExportTable } from "./exportTypes";

export function csvCell(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function tableToCsv(table: ExportTable): string {
  return [
    table.columns.map(csvCell).join(","),
    ...table.rows.map((row) => table.columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n");
}
