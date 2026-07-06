import { normalizeHeader } from "../shared/delimitedText";

const aliases: Record<string, readonly string[]> = {
  reference: ["reference", "ref", "refdes", "designator"],
  x: ["x", "posx", "midx", "centerx", "xposition"],
  y: ["y", "posy", "midy", "centery", "yposition"],
  rotation: ["rotation", "rot", "angle", "orientation"],
  side: ["side", "layer", "boardside"],
  footprint: ["package", "footprint"],
  value: ["value"]
};

export function mapPlacementColumns(headers: readonly string[]): Record<string, string | undefined> {
  const normalized = new Map(headers.map((header) => [normalizeHeader(header), header]));

  return Object.fromEntries(
    Object.entries(aliases).map(([field, names]) => [
      field,
      names.map((name) => normalized.get(name)).find(Boolean)
    ])
  );
}
