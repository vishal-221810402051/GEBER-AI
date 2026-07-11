import { unitScale } from "./gerberCoordinate";
import type {
  GerberApertureDefinition,
  GerberDiagnostic,
  GerberUnits
} from "./gerberTypes";

function positive(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

function addDiagnostic(diagnostics: GerberDiagnostic[], diagnostic: GerberDiagnostic, limit: number) {
  if (diagnostics.length < limit) {
    diagnostics.push(diagnostic);
  }
}

export function parseApertureDefinition(input: {
  statement: string;
  units: GerberUnits | null;
  macroNames: ReadonlySet<string>;
  sourceBlock: number;
  diagnostics: GerberDiagnostic[];
  maxDiagnostics: number;
}): GerberApertureDefinition | null {
  const match = input.statement.match(/^ADD(\d+)([A-Za-z_$][A-Za-z0-9_$.-]*),?(.+)?$/);
  if (!match) {
    addDiagnostic(input.diagnostics, {
      code: "malformed-aperture-definition",
      severity: "warning",
      message: "Aperture definition could not be parsed.",
      sourceBlock: input.sourceBlock,
      rawStatement: input.statement
    }, input.maxDiagnostics);
    return null;
  }

  if (!input.units) {
    addDiagnostic(input.diagnostics, {
      code: "missing-units",
      severity: "error",
      message: "Aperture definition appeared before units were declared.",
      sourceBlock: input.sourceBlock,
      rawStatement: input.statement
    }, input.maxDiagnostics);
    return null;
  }

  const code = Number(match[1]);
  const kind = match[2];
  const modifiers = (match[3] ?? "")
    .split(/[xX]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  const scale = unitScale(input.units);
  const mm = (value: number | undefined) => positive(value) ? value * scale : undefined;

  if (kind === "C") {
    const diameterMm = mm(modifiers[0]);
    if (!diameterMm) {
      addDiagnostic(input.diagnostics, {
        code: "malformed-aperture-definition",
        severity: "warning",
        message: "Circle aperture is missing a positive diameter.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.statement
      }, input.maxDiagnostics);
      return null;
    }

    return {
      kind: "circle",
      code,
      diameterMm,
      holeDiameterMm: mm(modifiers[1])
    };
  }

  if (kind === "R" || kind === "O") {
    const widthMm = mm(modifiers[0]);
    const heightMm = mm(modifiers[1]);
    if (!widthMm || !heightMm) {
      addDiagnostic(input.diagnostics, {
        code: "malformed-aperture-definition",
        severity: "warning",
        message: `${kind === "R" ? "Rectangle" : "Obround"} aperture is missing positive width/height modifiers.`,
        sourceBlock: input.sourceBlock,
        rawStatement: input.statement
      }, input.maxDiagnostics);
      return null;
    }

    return {
      kind: kind === "R" ? "rectangle" : "obround",
      code,
      widthMm,
      heightMm,
      holeDiameterMm: mm(modifiers[2])
    };
  }

  if (kind === "P") {
    const outerDiameterMm = mm(modifiers[0]);
    const vertices = modifiers[1];
    if (!outerDiameterMm || !Number.isInteger(vertices) || vertices < 3) {
      addDiagnostic(input.diagnostics, {
        code: "malformed-aperture-definition",
        severity: "warning",
        message: "Polygon aperture requires a positive diameter and at least three vertices.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.statement
      }, input.maxDiagnostics);
      return null;
    }

    return {
      kind: "polygon",
      code,
      outerDiameterMm,
      vertices,
      rotationDeg: modifiers[2] ?? 0,
      holeDiameterMm: mm(modifiers[3])
    };
  }

  if (input.macroNames.has(kind)) {
    addDiagnostic(input.diagnostics, {
      code: "unsupported-aperture-macro",
      severity: "warning",
      message: `Aperture D${code} uses macro ${kind}; macro geometry is preserved but not evaluated in D2.`,
      sourceBlock: input.sourceBlock,
      rawStatement: input.statement
    }, input.maxDiagnostics);
    return {
      kind: "macro",
      code,
      macroName: kind,
      modifiers: modifiers.filter(Number.isFinite),
      supported: false
    };
  }

  addDiagnostic(input.diagnostics, {
    code: "unsupported-aperture-type",
    severity: "warning",
    message: `Unsupported aperture type or unknown macro '${kind}'.`,
    sourceBlock: input.sourceBlock,
    rawStatement: input.statement
  }, input.maxDiagnostics);
  return null;
}

export function apertureStrokeDiameter(aperture?: GerberApertureDefinition): number | null {
  if (!aperture) return null;
  if (aperture.kind === "circle") return aperture.diameterMm;
  if (aperture.kind === "rectangle" || aperture.kind === "obround") {
    return Math.max(aperture.widthMm, aperture.heightMm);
  }
  if (aperture.kind === "polygon") return aperture.outerDiameterMm;
  return null;
}
