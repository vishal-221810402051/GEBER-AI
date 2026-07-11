import type {
  GerberCoordinateFormat,
  GerberDiagnostic,
  GerberPointMm,
  GerberUnits
} from "./gerberTypes";

const inchToMm = 25.4;

export function unitScale(units: GerberUnits): number {
  return units === "inch" ? inchToMm : 1;
}

function addDiagnostic(
  diagnostics: GerberDiagnostic[],
  diagnostic: GerberDiagnostic,
  maxDiagnostics: number
) {
  if (diagnostics.length < maxDiagnostics) {
    diagnostics.push(diagnostic);
  }
}

export function decodeGerberNumber(input: {
  raw: string;
  axis: "x" | "y";
  format: GerberCoordinateFormat | null;
  units: GerberUnits | null;
  sourceBlock: number;
  diagnostics: GerberDiagnostic[];
  maxDiagnostics: number;
}): number | null {
  const { raw, axis, format, units, sourceBlock, diagnostics, maxDiagnostics } = input;

  if (!format) {
    addDiagnostic(diagnostics, {
      code: "missing-coordinate-format",
      severity: "error",
      message: "Coordinate data was encountered before a usable %FS coordinate format.",
      sourceBlock,
      rawStatement: raw
    }, maxDiagnostics);
    return null;
  }

  if (!units) {
    addDiagnostic(diagnostics, {
      code: "missing-units",
      severity: "error",
      message: "Coordinate data was encountered before units were declared.",
      sourceBlock,
      rawStatement: raw
    }, maxDiagnostics);
    return null;
  }

  const sign = raw.startsWith("-") ? -1 : 1;
  const unsigned = raw.replace(/^[+-]/, "");
  if (!/^\d+(?:\.\d+)?$/.test(unsigned)) {
    addDiagnostic(diagnostics, {
      code: "invalid-coordinate",
      severity: "error",
      message: `Invalid ${axis.toUpperCase()} coordinate.`,
      sourceBlock,
      rawStatement: raw
    }, maxDiagnostics);
    return null;
  }

  if (unsigned.includes(".")) {
    const parsed = Number(unsigned);
    return Number.isFinite(parsed) ? sign * parsed * unitScale(units) : null;
  }

  const integerDigits = axis === "x" ? format.xIntegerDigits : format.yIntegerDigits;
  const decimalDigits = axis === "x" ? format.xDecimalDigits : format.yDecimalDigits;
  const totalDigits = integerDigits + decimalDigits;

  if (totalDigits <= 0 || totalDigits > 12 || unsigned.length > totalDigits) {
    addDiagnostic(diagnostics, {
      code: "invalid-coordinate",
      severity: "error",
      message: `Coordinate digit length is outside the active ${axis.toUpperCase()} format.`,
      sourceBlock,
      rawStatement: raw
    }, maxDiagnostics);
    return null;
  }

  const digits = format.zeroSuppression === "trailing"
    ? unsigned.padEnd(totalDigits, "0")
    : unsigned.padStart(totalDigits, "0");
  const integerPart = digits.slice(0, integerDigits) || "0";
  const decimalPart = digits.slice(integerDigits) || "0";
  const parsed = Number(`${integerPart}.${decimalPart}`);

  if (!Number.isFinite(parsed) || Math.abs(parsed) > 1_000_000) {
    addDiagnostic(diagnostics, {
      code: "invalid-coordinate",
      severity: "error",
      message: "Decoded coordinate is not finite or is outside safe bounds.",
      sourceBlock,
      rawStatement: raw
    }, maxDiagnostics);
    return null;
  }

  return sign * parsed * unitScale(units);
}

export function pointFromModal(input: {
  xRaw?: string;
  yRaw?: string;
  currentPoint: GerberPointMm | null;
  coordinateMode: "absolute" | "incremental";
  format: GerberCoordinateFormat | null;
  units: GerberUnits | null;
  sourceBlock: number;
  diagnostics: GerberDiagnostic[];
  maxDiagnostics: number;
}): GerberPointMm | null {
  const current = input.currentPoint ?? { x: 0, y: 0 };
  const decodedX = input.xRaw === undefined
    ? null
    : decodeGerberNumber({
        raw: input.xRaw,
        axis: "x",
        format: input.format,
        units: input.units,
        sourceBlock: input.sourceBlock,
        diagnostics: input.diagnostics,
        maxDiagnostics: input.maxDiagnostics
      });
  const decodedY = input.yRaw === undefined
    ? null
    : decodeGerberNumber({
        raw: input.yRaw,
        axis: "y",
        format: input.format,
        units: input.units,
        sourceBlock: input.sourceBlock,
        diagnostics: input.diagnostics,
        maxDiagnostics: input.maxDiagnostics
      });

  if ((input.xRaw !== undefined && decodedX === null) || (input.yRaw !== undefined && decodedY === null)) {
    return null;
  }

  if (input.coordinateMode === "incremental") {
    return {
      x: current.x + (decodedX ?? 0),
      y: current.y + (decodedY ?? 0)
    };
  }

  return {
    x: decodedX ?? current.x,
    y: decodedY ?? current.y
  };
}
