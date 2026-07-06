import type {
  KiCadLibrarySymbol,
  KiCadSchematicLabel,
  KiCadSchematicSheet,
  KiCadSchematicSummary,
  KiCadSchematicSymbol,
  KiCadSchematicWire,
  KiCadSchematicJunction
} from "./kicadSchematicTypes";

export function extractKicadSchematicSummary(input: {
  librarySymbols: readonly KiCadLibrarySymbol[];
  symbols: readonly KiCadSchematicSymbol[];
  labels: readonly KiCadSchematicLabel[];
  wires: readonly KiCadSchematicWire[];
  junctions: readonly KiCadSchematicJunction[];
  noConnects: readonly KiCadSchematicJunction[];
  sheets: readonly KiCadSchematicSheet[];
}): KiCadSchematicSummary {
  return {
    symbolInstanceCount: input.symbols.length,
    librarySymbolCount: input.librarySymbols.length,
    propertyCount: input.symbols.reduce(
      (total, symbol) => total + symbol.properties.length,
      0
    ),
    labelCount: input.labels.length,
    globalLabelCount: input.labels.filter((label) => label.kind === "global_label").length,
    hierarchicalLabelCount: input.labels.filter((label) => label.kind === "hierarchical_label").length,
    wireCount: input.wires.length,
    junctionCount: input.junctions.length,
    noConnectCount: input.noConnects.length,
    sheetCount: input.sheets.length,
    symbolsInBom: input.symbols.filter((symbol) => symbol.inBom).length,
    symbolsOnBoard: input.symbols.filter((symbol) => symbol.onBoard).length,
    symbolsWithFootprint: input.symbols.filter((symbol) => Boolean(symbol.footprint)).length,
    symbolsMissingFootprint: input.symbols.filter((symbol) => !symbol.footprint).length
  };
}
