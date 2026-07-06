import type {
  KiCadPcbBoundingBox,
  KiCadPcbOutlinePrimitive,
  KiCadPcbSummary
} from "./kicadPcbTypes";

export function extractKicadPcbSummary(input: {
  layers: readonly { type: string; name: string }[];
  nets: readonly unknown[];
  footprints: readonly { pads: readonly unknown[] }[];
  trackSegments: readonly unknown[];
  vias: readonly unknown[];
  zones: readonly unknown[];
  outlinePrimitives: readonly KiCadPcbOutlinePrimitive[];
}): KiCadPcbSummary {
  const points = input.outlinePrimitives.flatMap((primitive) => primitive.points);
  const boundingBox: KiCadPcbBoundingBox | undefined =
    points.length > 0
      ? {
          minX: Math.min(...points.map((point) => point.x)),
          minY: Math.min(...points.map((point) => point.y)),
          maxX: Math.max(...points.map((point) => point.x)),
          maxY: Math.max(...points.map((point) => point.y)),
          width:
            Math.max(...points.map((point) => point.x)) -
            Math.min(...points.map((point) => point.x)),
          height:
            Math.max(...points.map((point) => point.y)) -
            Math.min(...points.map((point) => point.y)),
          confidence: "inferred-medium"
        }
      : undefined;

  return {
    layerCount: input.layers.length,
    copperLayerCount: input.layers.filter(
      (layer) => layer.type === "signal" || layer.name.endsWith(".Cu")
    ).length,
    netCount: input.nets.length,
    footprintCount: input.footprints.length,
    padCount: input.footprints.reduce(
      (total, footprint) => total + footprint.pads.length,
      0
    ),
    trackSegmentCount: input.trackSegments.length,
    viaCount: input.vias.length,
    zoneCount: input.zones.length,
    edgeCutsPrimitiveCount: input.outlinePrimitives.length,
    outlineStatus: boundingBox
      ? input.outlinePrimitives.some((primitive) => primitive.kind === "arc")
        ? "partial"
        : "estimated"
      : "not-found",
    boundingBox
  };
}
