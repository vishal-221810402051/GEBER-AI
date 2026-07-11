import { classifyFile } from "../intake/classifyFile";
import type { GerberPackageEntryClassification } from "./gerberPackageTypes";

function emptyFile(fileName: string): File {
  return new File([new Uint8Array()], fileName, {
    type: "application/octet-stream",
    lastModified: 1
  });
}

function looksAuxiliary(fileName: string) {
  return /(?:readme|fab|fabrication|notes?|job|report|stackup|layers?)/i.test(fileName);
}

export function classifyGerberPackageEntry(fileName: string): GerberPackageEntryClassification {
  const classified = classifyFile(emptyFile(fileName));

  if (classified.category === "gerber" || classified.category === "gerber-x2") {
    return {
      status: "gerber",
      category: classified.category,
      classification: classified.categoryLabel,
      diagnostic: "Gerber file detected. Geometry parsing is not implemented yet."
    };
  }

  if (classified.category === "drill" || looksAuxiliary(fileName)) {
    return {
      status: "auxiliary",
      category: classified.category,
      classification: classified.categoryLabel,
      diagnostic: "Auxiliary package entry retained for diagnostics only; it is not canonical Gerber evidence."
    };
  }

  if (classified.category === "archive" || classified.category === "easyeda-export") {
    return {
      status: "unsupported",
      category: classified.category,
      classification: classified.categoryLabel,
      diagnostic: "Nested archives and noncanonical export packages are not expanded in this phase."
    };
  }

  return {
    status: classified.category === "unknown" ? "unsupported" : "ignored",
    category: classified.category,
    classification: classified.categoryLabel,
    diagnostic: "Entry is not a canonical schematic or Gerber file and was not added to the active workflow."
  };
}
