import { normalizeHeader } from "../shared/delimitedText";

const aliases: Record<string, readonly string[]> = {
  references: ["reference", "references", "ref", "refdes", "designator"],
  quantity: ["quantity", "qty"],
  value: ["value"],
  footprint: ["footprint", "package"],
  description: ["description", "desc"],
  manufacturerPartNumber: ["manufacturerpartnumber", "mpn", "partnumber"],
  supplierPartNumber: ["supplierpartnumber", "lcsc", "digikey", "mouser"],
  supplier: ["supplier"],
  tolerance: ["tolerance"],
  voltageRating: ["voltage", "voltagerating"],
  currentRating: ["current", "currentrating"],
  notes: ["notes", "note"]
};

export function mapBomColumns(headers: readonly string[]): Record<string, string | undefined> {
  const normalized = new Map(headers.map((header) => [normalizeHeader(header), header]));

  return Object.fromEntries(
    Object.entries(aliases).map(([field, names]) => [
      field,
      names.map((name) => normalized.get(name)).find(Boolean)
    ])
  );
}
