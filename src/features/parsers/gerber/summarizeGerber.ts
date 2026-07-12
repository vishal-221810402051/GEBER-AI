import type { GerberParseResult } from "./gerberTypes";
import { summarizeGerberProjectX2 } from "./summarizeGerberAttributes";
import type { GerberProjectX2Summary } from "./gerberAttributeTypes";

export type GerberProjectSummary = Readonly<{
  totalFiles: number;
  parsedFiles: number;
  warningFiles: number;
  failedFiles: number;
  totalPrimitives: number;
  totalApertures: number;
  filesWithGeometry: number;
  filesWithPartialGeometry: number;
  filesWithX2Attributes: number;
  candidateOutlineFiles: readonly string[];
  diagnosticsCount: number;
  x2: GerberProjectX2Summary;
}>;

const outlinePattern = /(edge\.cuts|outline|profile|gko|gm1|gml|gmb|fab)/i;

export function summarizeGerberProject(
  results: readonly GerberParseResult[]
): GerberProjectSummary {
  return {
    totalFiles: results.length,
    parsedFiles: results.filter((result) => result.status === "parsed").length,
    warningFiles: results.filter((result) => result.status === "parsed-with-warnings").length,
    failedFiles: results.filter((result) => result.status === "failed").length,
    totalPrimitives: results.reduce((total, result) => total + result.primitives.length, 0),
    totalApertures: results.reduce((total, result) => total + result.apertures.length, 0),
    filesWithGeometry: results.filter((result) => result.primitives.length > 0).length,
    filesWithPartialGeometry: results.filter((result) => result.geometryCoverage === "partial").length,
    filesWithX2Attributes: results.filter((result) => result.summary.x2AttributeCount > 0).length,
    candidateOutlineFiles: results
      .filter((result) => outlinePattern.test(result.sourceFileName) || outlinePattern.test(result.sourceRelativePath ?? ""))
      .map((result) => result.sourceFileId),
    diagnosticsCount: results.reduce((total, result) => total + result.diagnostics.length, 0),
    x2: summarizeGerberProjectX2(results)
  };
}
