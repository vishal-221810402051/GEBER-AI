export type ExportTable = Readonly<{
  filename: string;
  columns: readonly string[];
  rows: readonly Readonly<Record<string, unknown>>[];
}>;

export type ExportResult = Readonly<{
  ok: boolean;
  message: string;
}>;
