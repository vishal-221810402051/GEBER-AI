import {
  atom,
  childLists,
  firstChild,
  head,
  numberValue,
  parseKiCadSexpr,
  type KiCadSexprList
} from "./kicadSexpr";
import { extractKicadPcbSummary } from "./extractKicadPcbSummary";
import type {
  KiCadPcbFootprint,
  KiCadPcbLayer,
  KiCadPcbMetadata,
  KiCadPcbNet,
  KiCadPcbOutlinePrimitive,
  KiCadPcbPad,
  KiCadPcbParseResult,
  KiCadPcbParserDiagnostic,
  KiCadPcbTrackSegment,
  KiCadPcbVia,
  KiCadPcbZone
} from "./kicadPcbTypes";

function diagnostic(message: string, severity: KiCadPcbParserDiagnostic["severity"] = "medium"): KiCadPcbParserDiagnostic {
  return {
    severity,
    message,
    confidence: "direct",
    parserStage: "kicad-pcb-parser"
  };
}

function childAtom(node: KiCadSexprList, name: string, index = 1): string | undefined {
  return atom(firstChild(node, name)?.items[index]);
}

function childNumber(node: KiCadSexprList, name: string, index = 1): number | undefined {
  return numberValue(firstChild(node, name)?.items[index]);
}

function parseMetadata(root: KiCadSexprList): KiCadPcbMetadata {
  const setup = firstChild(root, "setup");
  const general = firstChild(root, "general");
  return {
    version: childAtom(root, "version"),
    generator: childAtom(root, "generator"),
    generatorVersion: childAtom(root, "generator_version"),
    paper: childAtom(root, "paper"),
    thickness: general
      ? childNumber(general, "thickness")
      : setup
        ? childNumber(setup, "thickness")
        : undefined
  };
}

function parseLayers(root: KiCadSexprList): KiCadPcbLayer[] {
  const layers = firstChild(root, "layers");
  if (!layers) {
    return [];
  }

  return childLists(layers).map((layer): KiCadPcbLayer => ({
    id: atom(layer.items[0]) ?? "unknown",
    name: atom(layer.items[1]) ?? "unknown",
    type: atom(layer.items[2]) ?? "unknown",
    function: atom(layer.items[3])
  }));
}

function parseNets(root: KiCadSexprList): KiCadPcbNet[] {
  return childLists(root, "net").map((net): KiCadPcbNet => ({
    id: atom(net.items[1]) ?? "unknown",
    name: atom(net.items[2]) ?? ""
  }));
}

function parsePad(pad: KiCadSexprList): KiCadPcbPad {
  const at = firstChild(pad, "at");
  const size = firstChild(pad, "size");
  const drill = firstChild(pad, "drill");
  const layers = firstChild(pad, "layers");
  const net = firstChild(pad, "net");

  return {
    number: atom(pad.items[1]) ?? "",
    type: atom(pad.items[2]),
    shape: atom(pad.items[3]),
    x: numberValue(at?.items[1]),
    y: numberValue(at?.items[2]),
    sizeX: numberValue(size?.items[1]),
    sizeY: numberValue(size?.items[2]),
    drill: numberValue(drill?.items[1]),
    layers: layers?.items.slice(1).map((item) => atom(item) ?? "").filter(Boolean) ?? [],
    netId: atom(net?.items[1]),
    netName: atom(net?.items[2])
  };
}

function parseFootprints(root: KiCadSexprList): KiCadPcbFootprint[] {
  return childLists(root)
    .filter((item) => head(item) === "footprint" || head(item) === "module")
    .map((footprint): KiCadPcbFootprint => {
      const properties = Object.fromEntries(
        childLists(footprint, "property").map((property) => [
          atom(property.items[1]) ?? "",
          atom(property.items[2]) ?? ""
        ])
      );
      const referenceText = childLists(footprint, "fp_text").find(
        (item) => atom(item.items[1]) === "reference"
      );
      const valueText = childLists(footprint, "fp_text").find(
        (item) => atom(item.items[1]) === "value"
      );
      const at = firstChild(footprint, "at");
      const pads = childLists(footprint, "pad").map(parsePad);

      return {
        reference: properties.Reference || atom(referenceText?.items[2]),
        value: properties.Value || atom(valueText?.items[2]),
        footprintName: atom(footprint.items[1]) ?? "unknown",
        layer: childAtom(footprint, "layer"),
        x: numberValue(at?.items[1]),
        y: numberValue(at?.items[2]),
        rotation: numberValue(at?.items[3]),
        description: childAtom(footprint, "descr"),
        tags: childAtom(footprint, "tags"),
        properties,
        pads,
        padNetNames: Array.from(
          new Set(pads.map((pad) => pad.netName).filter((value): value is string => Boolean(value)))
        )
      };
    });
}

function parseSegments(root: KiCadSexprList): KiCadPcbTrackSegment[] {
  return childLists(root, "segment").map((segment): KiCadPcbTrackSegment => {
    const start = firstChild(segment, "start");
    const end = firstChild(segment, "end");
    return {
      startX: numberValue(start?.items[1]),
      startY: numberValue(start?.items[2]),
      endX: numberValue(end?.items[1]),
      endY: numberValue(end?.items[2]),
      width: childNumber(segment, "width"),
      layer: childAtom(segment, "layer"),
      netId: childAtom(segment, "net")
    };
  });
}

function parseVias(root: KiCadSexprList): KiCadPcbVia[] {
  return childLists(root, "via").map((via): KiCadPcbVia => {
    const at = firstChild(via, "at");
    const layers = firstChild(via, "layers");
    return {
      x: numberValue(at?.items[1]),
      y: numberValue(at?.items[2]),
      size: childNumber(via, "size"),
      drill: childNumber(via, "drill"),
      layers: layers?.items.slice(1).map((item) => atom(item) ?? "").filter(Boolean) ?? [],
      netId: childAtom(via, "net")
    };
  });
}

function parseZones(root: KiCadSexprList): KiCadPcbZone[] {
  return childLists(root, "zone").map((zone): KiCadPcbZone => {
    const layers = firstChild(zone, "layers");
    return {
      netId: childAtom(zone, "net"),
      netName: childAtom(zone, "net_name"),
      name: childAtom(zone, "name"),
      layers: layers?.items.slice(1).map((item) => atom(item) ?? "").filter(Boolean) ?? []
    };
  });
}

function parsePoint(node: KiCadSexprList | undefined): { x: number; y: number } | undefined {
  const x = numberValue(node?.items[1]);
  const y = numberValue(node?.items[2]);
  return x === undefined || y === undefined ? undefined : { x, y };
}

function parseOutline(root: KiCadSexprList): KiCadPcbOutlinePrimitive[] {
  return childLists(root)
    .filter((item) => ["gr_line", "gr_arc", "gr_rect"].includes(head(item) ?? ""))
    .filter((item) => childAtom(item, "layer") === "Edge.Cuts")
    .map((item): KiCadPcbOutlinePrimitive => {
      const kind = head(item) === "gr_arc" ? "arc" : head(item) === "gr_rect" ? "rect" : "line";
      const points = [
        parsePoint(firstChild(item, "start")),
        parsePoint(firstChild(item, "end")),
        parsePoint(firstChild(item, "mid")),
        parsePoint(firstChild(item, "center"))
      ].filter((point): point is { x: number; y: number } => Boolean(point));

      return {
        kind,
        layer: "Edge.Cuts",
        points
      };
    });
}

function emptyResult(sourceFileId: string, sourceFileName: string, diagnostics: KiCadPcbParserDiagnostic[]): KiCadPcbParseResult {
  return {
    success: false,
    sourceFileId,
    sourceFileName,
    metadata: {},
    layers: [],
    nets: [],
    footprints: [],
    trackSegments: [],
    vias: [],
    zones: [],
    outlinePrimitives: [],
    summary: extractKicadPcbSummary({
      layers: [],
      nets: [],
      footprints: [],
      trackSegments: [],
      vias: [],
      zones: [],
      outlinePrimitives: []
    }),
    diagnostics
  };
}

export function parseKicadPcb(source: string, sourceFileId: string, sourceFileName: string): KiCadPcbParseResult {
  const diagnostics: KiCadPcbParserDiagnostic[] = [];

  if (!source.trim()) {
    return emptyResult(sourceFileId, sourceFileName, [
      diagnostic("KiCad PCB file is empty.", "critical")
    ]);
  }

  if (source.length > 8_000_000) {
    diagnostics.push(
      diagnostic("Large KiCad PCB file parsed in browser; UI responsiveness may vary.", "low")
    );
  }

  try {
    const root = parseKiCadSexpr(source);

    if (head(root) !== "kicad_pcb") {
      return emptyResult(sourceFileId, sourceFileName, [
        diagnostic("Missing top-level kicad_pcb form.", "critical")
      ]);
    }

    const metadata = parseMetadata(root);
    const layers = parseLayers(root);
    const nets = parseNets(root);
    const footprints = parseFootprints(root);
    const trackSegments = parseSegments(root);
    const vias = parseVias(root);
    const zones = parseZones(root);
    const outlinePrimitives = parseOutline(root);

    if (layers.length === 0) {
      diagnostics.push(diagnostic("No layers section was parsed.", "high"));
    }
    if (nets.length === 0) {
      diagnostics.push(diagnostic("No net declarations were parsed.", "medium"));
    }
    if (footprints.length === 0) {
      diagnostics.push(diagnostic("No footprints were parsed from the PCB layout.", "medium"));
    }
    if (outlinePrimitives.length === 0) {
      diagnostics.push(diagnostic("No Edge.Cuts outline primitives were parsed.", "medium"));
    }

    return {
      success: true,
      sourceFileId,
      sourceFileName,
      metadata,
      layers,
      nets,
      footprints,
      trackSegments,
      vias,
      zones,
      outlinePrimitives,
      summary: extractKicadPcbSummary({
        layers,
        nets,
        footprints,
        trackSegments,
        vias,
        zones,
        outlinePrimitives
      }),
      diagnostics
    };
  } catch (error) {
    return emptyResult(sourceFileId, sourceFileName, [
      diagnostic(
        error instanceof Error
          ? `Invalid KiCad PCB S-expression: ${error.message}`
          : "Invalid KiCad PCB S-expression.",
        "critical"
      )
    ]);
  }
}
