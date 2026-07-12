import type { GerberParseResult } from "./gerberTypes";
import type { GerberProjectX2Summary, GerberX2ParseResult } from "./gerberAttributeTypes";

const previewLimit = 100;

function filenameInference(fileName: string) {
  const lower = fileName.toLowerCase();
  if (/\.(gtl|cmp)$/.test(lower) || /f\.cu|top.*copper/.test(lower)) return "top copper";
  if (/\.(gbl|sol)$/.test(lower) || /b\.cu|bottom.*copper/.test(lower)) return "bottom copper";
  if (/edge\.cuts|outline|profile|\.gko$|\.gm1$/.test(lower)) return "profile";
  if (/mask|\.gts$|\.gbs$/.test(lower)) return "solder-mask";
  if (/silk|legend|\.gto$|\.gbo$/.test(lower)) return "legend";
  if (/paste|\.gtp$|\.gbp$/.test(lower)) return "paste";
  return undefined;
}

function declaredLabel(result: GerberParseResult) {
  const fileFunction = result.x2.fileAttributes.fileFunction;
  if (!fileFunction) return undefined;
  return [
    fileFunction.side,
    fileFunction.category === "copper" ? "copper" : fileFunction.category
  ].filter(Boolean).join(" ");
}

function uniquePreview(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, previewLimit);
}

export function summarizeGerberX2(input: {
  fileAttributes: GerberX2ParseResult["fileAttributes"];
  apertureAttributeSets: GerberX2ParseResult["apertureAttributeSets"];
  objectAttributeSets: GerberX2ParseResult["objectAttributeSets"];
  commandCount: number;
  deletionCommandCount: number;
  malformedAttributeCount: number;
  attributedApertureCount: number;
  attributedPrimitiveCount: number;
}) {
  const apertureSets = Object.values(input.apertureAttributeSets);
  const objectSets = Object.values(input.objectAttributeSets);
  const declaredNets = objectSets
    .map((set) => set.interpreted.net?.name)
    .filter(Boolean) as string[];
  const declaredComponents = objectSets
    .map((set) => set.interpreted.component?.reference ?? set.interpreted.pin?.componentReference)
    .filter(Boolean) as string[];
  const declaredPins = objectSets
    .map((set) => set.interpreted.pin?.pinNumber)
    .filter(Boolean) as string[];
  const unknownAttributeCount =
    input.fileAttributes.unknown.length +
    apertureSets.reduce((total, set) => total + set.interpreted.unknown.length, 0) +
    objectSets.reduce((total, set) => total + set.interpreted.unknown.length, 0);
  const parsedSignals =
    Boolean(input.fileAttributes.fileFunction) ||
    apertureSets.some((set) => set.interpreted.apertureFunction) ||
    declaredNets.length > 0 ||
    declaredComponents.length > 0 ||
    declaredPins.length > 0;

  return {
    commandCount: input.commandCount,
    fileAttributeCount: input.fileAttributes.raw.length,
    apertureAttributeCount: apertureSets.reduce((total, set) => total + set.raw.length, 0),
    objectAttributeCount: objectSets.reduce((total, set) => total + set.raw.length, 0),
    deletionCommandCount: input.deletionCommandCount,
    unknownAttributeCount,
    malformedAttributeCount: input.malformedAttributeCount,
    attributedApertureCount: input.attributedApertureCount,
    attributedPrimitiveCount: input.attributedPrimitiveCount,
    declaredNetCount: uniquePreview(declaredNets).length,
    declaredComponentReferenceCount: uniquePreview(declaredComponents).length,
    declaredPinCount: uniquePreview(declaredPins).length,
    hasFileFunction: Boolean(input.fileAttributes.fileFunction),
    hasApertureFunctions: apertureSets.some((set) => set.interpreted.apertureFunction),
    hasNetMetadata: declaredNets.length > 0,
    hasComponentMetadata: declaredComponents.length > 0,
    semanticCoverage: input.commandCount === 0
      ? "none" as const
      : input.malformedAttributeCount > 0 || unknownAttributeCount > 0 || !parsedSignals
        ? "partial" as const
        : "parsed" as const
  };
}

export function summarizeGerberProjectX2(
  results: readonly GerberParseResult[]
): GerberProjectX2Summary {
  const x2Results = results.filter((result) => result.x2.detected);
  const objectSets = x2Results.flatMap((result) => Object.values(result.x2.objectAttributeSets));

  return {
    x2FileCount: x2Results.length,
    x1FileCount: results.length - x2Results.length,
    filesWithDeclaredFunction: x2Results.filter((result) => result.x2.fileAttributes.fileFunction).length,
    filesWithNetMetadata: x2Results.filter((result) => result.x2.summary.hasNetMetadata).length,
    filesWithComponentMetadata: x2Results.filter((result) => result.x2.summary.hasComponentMetadata).length,
    filesWithPinMetadata: x2Results.filter((result) => result.x2.summary.declaredPinCount > 0).length,
    declaredLayerFunctions: x2Results
      .map((result) => {
        const fileFunction = result.x2.fileAttributes.fileFunction;
        return fileFunction ? {
          fileId: result.sourceFileId,
          fileName: result.sourceFileName,
          function: fileFunction.rawFunction,
          modifiers: fileFunction.rawModifiers
        } : undefined;
      })
      .filter(Boolean)
      .slice(0, previewLimit) as GerberProjectX2Summary["declaredLayerFunctions"],
    declaredNetNames: uniquePreview(objectSets.map((set) => set.interpreted.net?.name).filter(Boolean) as string[]),
    declaredComponentReferences: uniquePreview(objectSets
      .map((set) => set.interpreted.component?.reference ?? set.interpreted.pin?.componentReference)
      .filter(Boolean) as string[]),
    conflictingFileClassifications: x2Results
      .map((result) => {
        const declaredFunction = declaredLabel(result);
        const inferred = filenameInference(result.sourceFileName);
        if (!declaredFunction || !inferred || declaredFunction === inferred) {
          return undefined;
        }

        return {
          fileId: result.sourceFileId,
          fileName: result.sourceFileName,
          declaredFunction,
          filenameInference: inferred
        };
      })
      .filter(Boolean)
      .slice(0, previewLimit) as GerberProjectX2Summary["conflictingFileClassifications"]
  };
}
