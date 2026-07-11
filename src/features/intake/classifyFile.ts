import type {
  ClassificationConfidence,
  ClassifiedFile,
  FileCategory
} from "./intakeTypes";

const gerberExtensions = new Set([
  "gbr",
  "ger",
  "gtl",
  "gbl",
  "gts",
  "gbs",
  "gto",
  "gbo",
  "gko",
  "gm1",
  "gml",
  "cmp",
  "sol"
]);

const drillExtensions = new Set(["drl", "xln", "exc"]);
const bomExtensions = new Set(["xlsx", "xls"]);
const pickPlaceExtensions = new Set(["pos", "mnt", "pnp"]);

const labels: Record<FileCategory, string> = {
  "kicad-schematic": "KiCad schematic",
  "kicad-pcb": "KiCad PCB",
  "kicad-project": "KiCad project",
  gerber: "Gerber",
  "gerber-x2": "Gerber X2 candidate",
  drill: "Excellon drill",
  "ipc-netlist": "IPC-356 netlist",
  bom: "BOM",
  "pick-and-place": "Pick-and-place / centroid",
  "easyeda-export": "EasyEDA export candidate",
  archive: "Generic archive",
  "structured-table": "Generic CSV / structured table",
  unknown: "Unknown / unsupported"
};

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

function includesAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function classifyByMetadata(name: string): {
  category: FileCategory;
  confidence: ClassificationConfidence;
  note: string;
} {
  const lowerName = name.toLowerCase();
  const extension = getExtension(lowerName);

  if (lowerName.endsWith(".kicad_sch")) {
    return {
      category: "kicad-schematic",
      confidence: "direct",
      note: "Classified directly from the KiCad schematic extension."
    };
  }

  if (lowerName.endsWith(".kicad_pcb")) {
    return {
      category: "kicad-pcb",
      confidence: "direct",
      note: "Classified directly from the KiCad PCB extension."
    };
  }

  if (lowerName.endsWith(".kicad_pro")) {
    return {
      category: "kicad-project",
      confidence: "direct",
      note: "Classified directly from the KiCad project extension."
    };
  }

  if (extension === "csv" || extension === "tsv") {
    if (lowerName.includes("bom")) {
      return {
        category: "bom",
        confidence: "inferred-high",
        note: "CSV classification inferred from BOM filename pattern."
      };
    }

    if (includesAny(lowerName, ["pick", "place", "centroid", "position", "pos"])) {
      return {
        category: "pick-and-place",
        confidence: "inferred-high",
        note: "CSV classification inferred from placement filename pattern."
      };
    }

    return {
      category: "structured-table",
      confidence: "inferred-low",
      note: "Delimited table detected, but filename does not identify BOM or placement role."
    };
  }

  if (extension === "zip") {
    if (lowerName.includes("easyeda")) {
      return {
        category: "easyeda-export",
        confidence: "inferred-medium",
        note: "Archive classified as an EasyEDA export candidate from filename only."
      };
    }

    return {
      category: "archive",
      confidence: "inferred-medium",
      note: "Archive detected. Zip contents are not inspected in Phase 2."
    };
  }

  if (extension === "json" && lowerName.includes("easyeda")) {
    return {
      category: "easyeda-export",
      confidence: "inferred-high",
      note: "EasyEDA export candidate inferred from JSON extension and filename."
    };
  }

  if (gerberExtensions.has(extension)) {
    if (includesAny(lowerName, ["x2", "gerberx2", "gerber-x2"])) {
      return {
        category: "gerber-x2",
        confidence: "inferred-medium",
        note: "Likely Gerber X2 from filename pattern; content confirmation requires parser phases."
      };
    }

    return {
      category: "gerber",
      confidence: "direct",
      note: "Gerber manufacturing file classified from extension."
    };
  }

  if (drillExtensions.has(extension) || lowerName.includes("drill")) {
    return {
      category: "drill",
      confidence: drillExtensions.has(extension) ? "direct" : "inferred-high",
      note: "Drill file classification is based on extension or drill filename pattern."
    };
  }

  if (extension === "ipc" || extension === "net" || extension === "356" || lowerName.includes("ipc")) {
    return {
      category: "ipc-netlist",
      confidence: extension === "ipc" || extension === "356" ? "direct" : "inferred-medium",
      note: "Netlist classification is based on IPC/netlist extension or filename pattern."
    };
  }

  if (bomExtensions.has(extension) || lowerName.includes("bom")) {
    return {
      category: "bom",
      confidence: bomExtensions.has(extension) ? "direct" : "inferred-high",
      note: "BOM classification is based on spreadsheet extension or BOM filename pattern."
    };
  }

  if (pickPlaceExtensions.has(extension) || includesAny(lowerName, ["pick", "place", "centroid", "positions"])) {
    return {
      category: "pick-and-place",
      confidence: pickPlaceExtensions.has(extension) ? "direct" : "inferred-high",
      note: "Placement classification is based on extension or centroid filename pattern."
    };
  }

  return {
    category: "unknown",
    confidence: extension ? "inferred-low" : "missing-data",
    note: "No supported Phase 2 filename or extension pattern matched."
  };
}

function getCompletenessContribution(category: FileCategory): string {
  switch (category) {
    case "kicad-schematic":
      return "Canonical schematic category, up to 50 points.";
    case "gerber":
    case "gerber-x2":
      return "Canonical Gerber/package category, up to 50 points.";
    case "archive":
      return "Canonical Gerber package candidate, up to 50 points when used as package evidence.";
    default:
      return "No canonical workflow completeness contribution.";
  }
}

export function classifyFile(file: File): ClassifiedFile {
  const classification = classifyByMetadata(file.name);
  const extension = getExtension(file.name);

  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || "Unavailable",
    extension: extension ? `.${extension}` : "Unavailable",
    category: classification.category,
    categoryLabel: labels[classification.category],
    confidence: classification.confidence,
    completenessContribution: getCompletenessContribution(classification.category),
    requiresParser: true,
    note: classification.note
  };
}
