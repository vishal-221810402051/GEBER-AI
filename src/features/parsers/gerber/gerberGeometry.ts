import { apertureStrokeDiameter } from "./gerberApertures";
import type {
  GerberApertureDefinition,
  GerberArcPrimitive,
  GerberBoundingBoxMm,
  GerberGeometryPrimitive,
  GerberPointMm,
  GerberRegionSegment
} from "./gerberTypes";

type MutableBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function expand(bounds: MutableBounds, point: GerberPointMm, margin = 0) {
  bounds.minX = Math.min(bounds.minX, point.x - margin);
  bounds.minY = Math.min(bounds.minY, point.y - margin);
  bounds.maxX = Math.max(bounds.maxX, point.x + margin);
  bounds.maxY = Math.max(bounds.maxY, point.y + margin);
}

function apertureByCode(apertures: readonly GerberApertureDefinition[], code: number) {
  return apertures.find((aperture) => aperture.code === code);
}

function normalizeAngle(angle: number) {
  const full = Math.PI * 2;
  const value = angle % full;
  return value < 0 ? value + full : value;
}

function angleOnSweep(angle: number, start: number, end: number, clockwise: boolean) {
  const full = Math.PI * 2;
  const a = normalizeAngle(angle);
  const s = normalizeAngle(start);
  const e = normalizeAngle(end);

  if (clockwise) {
    const sweep = (s - e + full) % full || full;
    const delta = (s - a + full) % full;
    return delta <= sweep + 1e-9;
  }

  const sweep = (e - s + full) % full || full;
  const delta = (a - s + full) % full;
  return delta <= sweep + 1e-9;
}

function expandArc(bounds: MutableBounds, arc: Pick<GerberArcPrimitive, "start" | "end" | "center" | "clockwise">, margin = 0) {
  expand(bounds, arc.start, margin);
  expand(bounds, arc.end, margin);
  const radius = Math.hypot(arc.start.x - arc.center.x, arc.start.y - arc.center.y);
  const startAngle = Math.atan2(arc.start.y - arc.center.y, arc.start.x - arc.center.x);
  const endAngle = Math.atan2(arc.end.y - arc.center.y, arc.end.x - arc.center.x);

  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle) => {
    if (angleOnSweep(angle, startAngle, endAngle, arc.clockwise)) {
      expand(bounds, {
        x: arc.center.x + Math.cos(angle) * radius,
        y: arc.center.y + Math.sin(angle) * radius
      }, margin);
    }
  });
}

function expandFlash(bounds: MutableBounds, point: GerberPointMm, aperture: GerberApertureDefinition) {
  if (aperture.kind === "circle") {
    expand(bounds, point, aperture.diameterMm / 2);
    return;
  }

  if (aperture.kind === "rectangle" || aperture.kind === "obround") {
    bounds.minX = Math.min(bounds.minX, point.x - aperture.widthMm / 2);
    bounds.maxX = Math.max(bounds.maxX, point.x + aperture.widthMm / 2);
    bounds.minY = Math.min(bounds.minY, point.y - aperture.heightMm / 2);
    bounds.maxY = Math.max(bounds.maxY, point.y + aperture.heightMm / 2);
    return;
  }

  if (aperture.kind === "polygon") {
    expand(bounds, point, aperture.outerDiameterMm / 2);
  }
}

function expandRegionSegment(bounds: MutableBounds, segment: GerberRegionSegment) {
  if (segment.kind === "line") {
    expand(bounds, segment.start);
    expand(bounds, segment.end);
    return;
  }

  expandArc(bounds, segment);
}

export function calculateGerberBounds(input: {
  primitives: readonly GerberGeometryPrimitive[];
  apertures: readonly GerberApertureDefinition[];
}): GerberBoundingBoxMm | null {
  const bounds: MutableBounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  };

  input.primitives.forEach((primitive) => {
    if (primitive.kind === "line") {
      const strokeDiameter = apertureStrokeDiameter(apertureByCode(input.apertures, primitive.apertureCode)) ?? 0;
      expand(bounds, primitive.start, strokeDiameter / 2);
      expand(bounds, primitive.end, strokeDiameter / 2);
      return;
    }

    if (primitive.kind === "arc") {
      const strokeDiameter = apertureStrokeDiameter(apertureByCode(input.apertures, primitive.apertureCode)) ?? 0;
      expandArc(bounds, primitive, strokeDiameter / 2);
      return;
    }

    if (primitive.kind === "flash") {
      const aperture = apertureByCode(input.apertures, primitive.apertureCode);
      if (aperture && aperture.kind !== "macro") {
        expandFlash(bounds, primitive.position, aperture);
      }
      return;
    }

    primitive.contours.forEach((contour) => {
      contour.segments.forEach((segment) => expandRegionSegment(bounds, segment));
    });
  });

  if (![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)) {
    return null;
  }

  return {
    minX: bounds.minX,
    minY: bounds.minY,
    maxX: bounds.maxX,
    maxY: bounds.maxY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY
  };
}

export function validateArcRadius(input: {
  start: GerberPointMm;
  end: GerberPointMm;
  center: GerberPointMm;
  toleranceMm?: number;
}): boolean {
  const startRadius = Math.hypot(input.start.x - input.center.x, input.start.y - input.center.y);
  const endRadius = Math.hypot(input.end.x - input.center.x, input.end.y - input.center.y);
  return Math.abs(startRadius - endRadius) <= (input.toleranceMm ?? 0.025);
}
