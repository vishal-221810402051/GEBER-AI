import {
  atom,
  childLists,
  firstChild,
  head,
  numberValue,
  parseKiCadSexpr,
  type KiCadSexprList
} from "../kicad-pcb/kicadSexpr";
import { extractKicadSchematicSummary } from "./extractKicadSchematicSummary";
import type {
  KiCadLibraryPin,
  KiCadLibrarySymbol,
  KiCadSchematicJunction,
  KiCadSchematicLabel,
  KiCadSchematicMetadata,
  KiCadSchematicNoConnect,
  KiCadSchematicParseResult,
  KiCadSchematicParserDiagnostic,
  KiCadSchematicProperty,
  KiCadSchematicSheet,
  KiCadSchematicSymbol,
  KiCadSchematicWire
} from "./kicadSchematicTypes";

function diagnostic(message: string, severity: KiCadSchematicParserDiagnostic["severity"] = "medium"): KiCadSchematicParserDiagnostic {
  return {
    severity,
    message,
    confidence: "direct",
    parserStage: "kicad-schematic-parser"
  };
}

function childAtom(node: KiCadSexprList, name: string, index = 1): string | undefined {
  return atom(firstChild(node, name)?.items[index]);
}

function booleanValue(value: string | undefined): boolean | undefined {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return undefined;
}

function parseAt(node: KiCadSexprList): { x?: number; y?: number; rotation?: number } {
  const at = firstChild(node, "at");
  return {
    x: numberValue(at?.items[1]),
    y: numberValue(at?.items[2]),
    rotation: numberValue(at?.items[3])
  };
}

function parseMetadata(root: KiCadSexprList): KiCadSchematicMetadata {
  const titleBlock = firstChild(root, "title_block");

  return {
    version: childAtom(root, "version"),
    generator: childAtom(root, "generator"),
    generatorVersion: childAtom(root, "generator_version"),
    uuid: childAtom(root, "uuid"),
    paper: childAtom(root, "paper"),
    titleBlock: titleBlock
      ? {
          title: childAtom(titleBlock, "title"),
          date: childAtom(titleBlock, "date"),
          revision: childAtom(titleBlock, "rev"),
          company: childAtom(titleBlock, "company"),
          comments: childLists(titleBlock, "comment")
            .map((comment) => atom(comment.items[2]) ?? atom(comment.items[1]) ?? "")
            .filter(Boolean)
        }
      : undefined
  };
}

function parseLibraryPin(pin: KiCadSexprList): KiCadLibraryPin {
  return {
    type: atom(pin.items[1]),
    electricalType: atom(pin.items[2]),
    unit: childAtom(pin, "unit"),
    name: childAtom(pin, "name"),
    number: childAtom(pin, "number")
  };
}

function parseLibrarySymbols(root: KiCadSexprList): KiCadLibrarySymbol[] {
  const libSymbols = firstChild(root, "lib_symbols");

  if (!libSymbols) {
    return [];
  }

  return childLists(libSymbols, "symbol").map((symbol) => {
    const id = atom(symbol.items[1]) ?? "unknown";
    return {
      id,
      name: id.split(":").at(-1) ?? id,
      pins: childLists(symbol, "pin").map(parseLibraryPin)
    };
  });
}

function parseProperties(node: KiCadSexprList): KiCadSchematicProperty[] {
  return childLists(node, "property").map((property) => ({
    name: atom(property.items[1]) ?? "",
    value: atom(property.items[2]) ?? ""
  }));
}

function propertyValue(properties: readonly KiCadSchematicProperty[], name: string): string | undefined {
  return properties.find((property) => property.name === name)?.value;
}

function parseSymbols(
  root: KiCadSexprList,
  sourceFileId: string,
  librarySymbols: readonly KiCadLibrarySymbol[]
): KiCadSchematicSymbol[] {
  return childLists(root, "symbol").map((symbol) => {
    const properties = parseProperties(symbol);
    const libId = childAtom(symbol, "lib_id");
    const position = parseAt(symbol);

    return {
      reference: propertyValue(properties, "Reference"),
      value: propertyValue(properties, "Value"),
      libId,
      footprint: propertyValue(properties, "Footprint"),
      datasheet: propertyValue(properties, "Datasheet"),
      description: propertyValue(properties, "Description"),
      properties,
      x: position.x,
      y: position.y,
      rotation: position.rotation,
      unit: childAtom(symbol, "unit"),
      inBom: booleanValue(childAtom(symbol, "in_bom")),
      onBoard: booleanValue(childAtom(symbol, "on_board")),
      uuid: childAtom(symbol, "uuid"),
      sourceFileId,
      pins: librarySymbols.find((librarySymbol) => librarySymbol.id === libId)?.pins ?? []
    };
  });
}

function parseLabels(root: KiCadSexprList): KiCadSchematicLabel[] {
  return childLists(root)
    .filter((node) => ["label", "global_label", "hierarchical_label", "text"].includes(head(node) ?? ""))
    .map((node) => {
      const position = parseAt(node);
      return {
        kind: head(node) as KiCadSchematicLabel["kind"],
        name: atom(node.items[1]) ?? "",
        x: position.x,
        y: position.y,
        rotation: position.rotation,
        shape: childAtom(node, "shape")
      };
    });
}

function parseWire(node: KiCadSexprList): KiCadSchematicWire {
  const pointsNode = firstChild(node, "pts");
  const points = pointsNode
    ? childLists(pointsNode, "xy")
        .map((point) => ({
          x: numberValue(point.items[1]),
          y: numberValue(point.items[2])
        }))
        .filter((point): point is { x: number; y: number } => point.x !== undefined && point.y !== undefined)
    : [];

  return { points };
}

function parseJunctionLike(node: KiCadSexprList): KiCadSchematicJunction {
  const position = parseAt(node);
  return {
    x: position.x,
    y: position.y,
    uuid: childAtom(node, "uuid")
  };
}

function parseSheets(root: KiCadSexprList): KiCadSchematicSheet[] {
  return childLists(root, "sheet").map((sheet) => {
    const position = parseAt(sheet);
    const size = firstChild(sheet, "size");
    const properties = parseProperties(sheet);

    return {
      name: propertyValue(properties, "Sheetname") ?? childAtom(sheet, "name"),
      file: propertyValue(properties, "Sheetfile") ?? childAtom(sheet, "file"),
      uuid: childAtom(sheet, "uuid"),
      x: position.x,
      y: position.y,
      width: numberValue(size?.items[1]),
      height: numberValue(size?.items[2]),
      pins: childLists(sheet, "pin").map((pin) => {
        const pinPosition = parseAt(pin);
        return {
          name: atom(pin.items[1]),
          type: atom(pin.items[2]),
          x: pinPosition.x,
          y: pinPosition.y
        };
      })
    };
  });
}

function emptyResult(sourceFileId: string, sourceFileName: string, diagnostics: KiCadSchematicParserDiagnostic[]): KiCadSchematicParseResult {
  const empty = {
    librarySymbols: [],
    symbols: [],
    labels: [],
    wires: [],
    junctions: [],
    noConnects: [],
    sheets: []
  };

  return {
    success: false,
    sourceFileId,
    sourceFileName,
    metadata: {},
    ...empty,
    summary: extractKicadSchematicSummary(empty),
    diagnostics
  };
}

export function parseKicadSchematic(source: string, sourceFileId: string, sourceFileName: string): KiCadSchematicParseResult {
  const diagnostics: KiCadSchematicParserDiagnostic[] = [];

  if (!source.trim()) {
    return emptyResult(sourceFileId, sourceFileName, [
      diagnostic("KiCad schematic file is empty.", "critical")
    ]);
  }

  if (source.length > 8_000_000) {
    diagnostics.push(
      diagnostic("Large KiCad schematic file parsed in browser; UI responsiveness may vary.", "low")
    );
  }

  try {
    const root = parseKiCadSexpr(source);

    if (head(root) !== "kicad_sch") {
      return emptyResult(sourceFileId, sourceFileName, [
        diagnostic("Missing top-level kicad_sch form.", "critical")
      ]);
    }

    const metadata = parseMetadata(root);
    const librarySymbols = parseLibrarySymbols(root);
    const symbols = parseSymbols(root, sourceFileId, librarySymbols);
    const labels = parseLabels(root);
    const wires = childLists(root, "wire").map(parseWire);
    const junctions = childLists(root, "junction").map(parseJunctionLike);
    const noConnects: KiCadSchematicNoConnect[] = childLists(root, "no_connect").map(parseJunctionLike);
    const sheets = parseSheets(root);

    if (librarySymbols.length === 0) {
      diagnostics.push(diagnostic("No lib_symbols section was parsed.", "medium"));
    }
    if (symbols.length === 0) {
      diagnostics.push(diagnostic("No schematic symbol instances were parsed.", "high"));
    }
    if (labels.length === 0) {
      diagnostics.push(diagnostic("No labels were parsed from the schematic.", "low"));
    }
    if (wires.length === 0) {
      diagnostics.push(diagnostic("No wire primitives were parsed from the schematic.", "medium"));
    }

    return {
      success: true,
      sourceFileId,
      sourceFileName,
      metadata,
      librarySymbols,
      symbols,
      labels,
      wires,
      junctions,
      noConnects,
      sheets,
      summary: extractKicadSchematicSummary({
        librarySymbols,
        symbols,
        labels,
        wires,
        junctions,
        noConnects,
        sheets
      }),
      diagnostics
    };
  } catch (error) {
    return emptyResult(sourceFileId, sourceFileName, [
      diagnostic(
        error instanceof Error
          ? `Invalid KiCad schematic S-expression: ${error.message}`
          : "Invalid KiCad schematic S-expression.",
        "critical"
      )
    ]);
  }
}
