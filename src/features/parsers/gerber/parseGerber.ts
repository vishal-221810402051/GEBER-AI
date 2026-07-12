import { parseApertureDefinition } from "./gerberApertures";
import {
  createAttributeSetInterner,
  interpretApertureAttributes,
  interpretFileAttributes,
  interpretObjectAttributes,
  parseGerberAttributeCommand
} from "./gerberAttributes";
import { summarizeGerberX2 } from "./summarizeGerberAttributes";
import { decodeGerberNumber, pointFromModal } from "./gerberCoordinate";
import { calculateGerberBounds, validateArcRadius } from "./gerberGeometry";
import { tokenizeGerber } from "./gerberTokenizer";
import type { ClassifiedFile } from "../../intake/intakeTypes";
import type { GerberRawAttribute } from "./gerberAttributeTypes";
import {
  GERBER_PARSER_LIMITS,
  type GerberApertureDefinition,
  type GerberDiagnostic,
  type GerberGeometryPrimitive,
  type GerberParseResult,
  type GerberParserState,
  type GerberPointMm,
  type GerberRegionContour,
  type GerberRegionSegment
} from "./gerberTypes";

type ParsedCommandBlock = Readonly<{
  xRaw?: string;
  yRaw?: string;
  iRaw?: string;
  jRaw?: string;
  operation?: "draw" | "move" | "flash";
}>;

function addDiagnostic(
  diagnostics: GerberDiagnostic[],
  diagnostic: GerberDiagnostic
) {
  if (diagnostics.length < GERBER_PARSER_LIMITS.maxDiagnostics) {
    diagnostics.push(diagnostic);
  }
}

function sourceKindFor(file?: ClassifiedFile): "direct-upload" | "gerber-package-entry" {
  return file?.sourceKind === "gerber-package-entry" ? "gerber-package-entry" : "direct-upload";
}

function initialState(): GerberParserState {
  return {
    units: null,
    format: null,
    interpolation: "linear",
    quadrantMode: "multi",
    polarity: "dark",
    currentApertureCode: null,
    currentPointMm: null,
    modalOperation: null,
    regionActive: false,
    currentRegionContours: [],
    currentRegionStartBlock: null,
    fileAttributes: new Map(),
    activeApertureAttributes: new Map(),
    activeObjectAttributes: new Map()
  };
}

function emptyX2Result() {
  return {
    detected: false,
    fileAttributes: {
      raw: [],
      unknown: []
    },
    apertureAttributeSets: {},
    objectAttributeSets: {},
    summary: {
      commandCount: 0,
      fileAttributeCount: 0,
      apertureAttributeCount: 0,
      objectAttributeCount: 0,
      deletionCommandCount: 0,
      unknownAttributeCount: 0,
      malformedAttributeCount: 0,
      attributedApertureCount: 0,
      attributedPrimitiveCount: 0,
      declaredNetCount: 0,
      declaredComponentReferenceCount: 0,
      declaredPinCount: 0,
      hasFileFunction: false,
      hasApertureFunctions: false,
      hasNetMetadata: false,
      hasComponentMetadata: false,
      semanticCoverage: "none" as const
    }
  };
}

function parseFormat(statement: string) {
  const match = statement.match(/^FS([LT]?)([AI]?)X(\d)(\d)Y(\d)(\d)/);
  if (!match) return null;

  return {
    zeroSuppression: match[1] === "L" ? "leading" as const : match[1] === "T" ? "trailing" as const : "none" as const,
    coordinateMode: match[2] === "I" ? "incremental" as const : "absolute" as const,
    xIntegerDigits: Number(match[3]),
    xDecimalDigits: Number(match[4]),
    yIntegerDigits: Number(match[5]),
    yDecimalDigits: Number(match[6])
  };
}

function parseMacroName(statement: string) {
  const body = statement.slice(2);
  return body.split("*")[0]?.trim() || "";
}

function commandTokens(statement: string): readonly string[] {
  return statement.match(/[GMTD]\d+|[XYIJ][+-]?\d+(?:\.\d+)?/gi) ?? [];
}

function parseCommandBlock(
  statement: string,
  onModalToken: (token: string) => void
): ParsedCommandBlock {
  const block: {
    xRaw?: string;
    yRaw?: string;
    iRaw?: string;
    jRaw?: string;
    operation?: "draw" | "move" | "flash";
  } = {};

  commandTokens(statement).forEach((rawToken) => {
    const token = rawToken.toUpperCase();
    const prefix = token[0];
    const value = token.slice(1);

    if (prefix === "X") block.xRaw = value;
    else if (prefix === "Y") block.yRaw = value;
    else if (prefix === "I") block.iRaw = value;
    else if (prefix === "J") block.jRaw = value;
    else if (prefix === "D" && token === "D01") block.operation = "draw";
    else if (prefix === "D" && token === "D02") block.operation = "move";
    else if (prefix === "D" && token === "D03") block.operation = "flash";
    else onModalToken(token);
  });

  return block;
}

function currentContour(contours: GerberRegionContour[]): { segments: GerberRegionSegment[] } {
  const last = contours.at(-1);
  if (last) {
    return last as { segments: GerberRegionSegment[] };
  }

  const contour = { segments: [] as GerberRegionSegment[] };
  contours.push(contour);
  return contour;
}

function rawAttributesArray(attributes: Map<string, GerberRawAttribute>) {
  return Array.from(attributes.values());
}

function apertureExists(apertures: readonly GerberApertureDefinition[], code: number | null) {
  return code !== null && apertures.some((aperture) => aperture.code === code);
}

function macroApertureSelected(apertures: readonly GerberApertureDefinition[], code: number | null) {
  return code !== null && apertures.some((aperture) => aperture.code === code && aperture.kind === "macro");
}

function pointForBlock(input: {
  parsed: ParsedCommandBlock;
  state: GerberParserState;
  sourceBlock: number;
  diagnostics: GerberDiagnostic[];
}): GerberPointMm | null {
  if (input.parsed.xRaw === undefined && input.parsed.yRaw === undefined) {
    return input.state.currentPointMm;
  }

  return pointFromModal({
    xRaw: input.parsed.xRaw,
    yRaw: input.parsed.yRaw,
    currentPoint: input.state.currentPointMm,
    coordinateMode: input.state.format?.coordinateMode ?? "absolute",
    format: input.state.format,
    units: input.state.units,
    sourceBlock: input.sourceBlock,
    diagnostics: input.diagnostics,
    maxDiagnostics: GERBER_PARSER_LIMITS.maxDiagnostics
  });
}

function arcCenterForBlock(input: {
  parsed: ParsedCommandBlock;
  state: GerberParserState;
  start: GerberPointMm;
  sourceBlock: number;
  diagnostics: GerberDiagnostic[];
}): GerberPointMm | null {
  const i = input.parsed.iRaw === undefined
    ? 0
    : decodeGerberNumber({
        raw: input.parsed.iRaw,
        axis: "x",
        format: input.state.format,
        units: input.state.units,
        sourceBlock: input.sourceBlock,
        diagnostics: input.diagnostics,
        maxDiagnostics: GERBER_PARSER_LIMITS.maxDiagnostics
      });
  const j = input.parsed.jRaw === undefined
    ? 0
    : decodeGerberNumber({
        raw: input.parsed.jRaw,
        axis: "y",
        format: input.state.format,
        units: input.state.units,
        sourceBlock: input.sourceBlock,
        diagnostics: input.diagnostics,
        maxDiagnostics: GERBER_PARSER_LIMITS.maxDiagnostics
      });

  if (i === null || j === null) return null;

  return {
    x: input.start.x + i,
    y: input.start.y + j
  };
}

function handleOperation(input: {
  parsed: ParsedCommandBlock;
  state: GerberParserState;
  apertures: readonly GerberApertureDefinition[];
  primitives: GerberGeometryPrimitive[];
  objectAttributeSetId?: string;
  sourceBlock: number;
  rawStatement: string;
  diagnostics: GerberDiagnostic[];
}) {
  const operation = input.parsed.operation ?? input.state.modalOperation;
  const hasCoordinate = input.parsed.xRaw !== undefined || input.parsed.yRaw !== undefined;

  if (!operation || !hasCoordinate) {
    return;
  }

  const nextPoint = pointForBlock({
    parsed: input.parsed,
    state: input.state,
    sourceBlock: input.sourceBlock,
    diagnostics: input.diagnostics
  });

  if (!nextPoint) return;

  if (operation === "move") {
    input.state.currentPointMm = nextPoint;
    input.state.modalOperation = "move";
    if (input.state.regionActive) {
      input.state.currentRegionContours.push({ segments: [] });
    }
    return;
  }

  if (operation === "flash") {
    if (!apertureExists(input.apertures, input.state.currentApertureCode)) {
      addDiagnostic(input.diagnostics, {
        code: "draw-without-aperture",
        severity: "error",
        message: "Flash operation encountered without a selected supported aperture.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    } else if (macroApertureSelected(input.apertures, input.state.currentApertureCode)) {
      addDiagnostic(input.diagnostics, {
        code: "unsupported-aperture-macro",
        severity: "warning",
        message: "Flash uses an aperture macro; exact macro geometry is not included in D2 bounds.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    } else {
      input.primitives.push({
        kind: "flash",
        position: nextPoint,
        apertureCode: input.state.currentApertureCode ?? 0,
        polarity: input.state.polarity,
        sourceBlock: input.sourceBlock,
        objectAttributeSetId: input.objectAttributeSetId
      });
    }

    input.state.currentPointMm = nextPoint;
    input.state.modalOperation = "flash";
    return;
  }

  const start = input.state.currentPointMm;
  if (!start) {
    addDiagnostic(input.diagnostics, {
      code: "invalid-coordinate",
      severity: "error",
      message: "Draw operation has no current start point.",
      sourceBlock: input.sourceBlock,
      rawStatement: input.rawStatement
    });
    input.state.currentPointMm = nextPoint;
    return;
  }

  if (input.state.interpolation === "linear") {
    if (input.state.regionActive) {
      currentContour(input.state.currentRegionContours as GerberRegionContour[]).segments.push({
        kind: "line",
        start,
        end: nextPoint,
        sourceBlock: input.sourceBlock
      });
    } else if (!apertureExists(input.apertures, input.state.currentApertureCode)) {
      addDiagnostic(input.diagnostics, {
        code: "draw-without-aperture",
        severity: "error",
        message: "Draw operation encountered without a selected supported aperture.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    } else if (macroApertureSelected(input.apertures, input.state.currentApertureCode)) {
      addDiagnostic(input.diagnostics, {
        code: "unsupported-aperture-macro",
        severity: "warning",
        message: "Draw uses an aperture macro; exact macro stroke geometry is not included in D2 bounds.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    } else {
      input.primitives.push({
        kind: "line",
        start,
        end: nextPoint,
        apertureCode: input.state.currentApertureCode ?? 0,
        polarity: input.state.polarity,
        sourceBlock: input.sourceBlock,
        objectAttributeSetId: input.objectAttributeSetId
      });
    }
  } else {
    const center = arcCenterForBlock({
      parsed: input.parsed,
      state: input.state,
      start,
      sourceBlock: input.sourceBlock,
      diagnostics: input.diagnostics
    });

    if (center) {
      if (input.state.quadrantMode === "single") {
        addDiagnostic(input.diagnostics, {
          code: "ambiguous-single-quadrant-arc",
          severity: "warning",
          message: "Single-quadrant arc mode is present; D2 preserves the arc but does not infer alternate centers.",
          sourceBlock: input.sourceBlock,
          rawStatement: input.rawStatement
        });
      }

      if (!validateArcRadius({ start, end: nextPoint, center })) {
        addDiagnostic(input.diagnostics, {
          code: "arc-radius-mismatch",
          severity: "warning",
          message: "Arc start/end radii differ beyond parser tolerance.",
          sourceBlock: input.sourceBlock,
          rawStatement: input.rawStatement
        });
      }

      const segment = {
        kind: "arc" as const,
        start,
        end: nextPoint,
        center,
        clockwise: input.state.interpolation === "clockwise-arc",
        sourceBlock: input.sourceBlock
      };

      if (input.state.regionActive) {
        currentContour(input.state.currentRegionContours as GerberRegionContour[]).segments.push(segment);
      } else if (!apertureExists(input.apertures, input.state.currentApertureCode)) {
        addDiagnostic(input.diagnostics, {
          code: "draw-without-aperture",
          severity: "error",
          message: "Arc draw encountered without a selected supported aperture.",
          sourceBlock: input.sourceBlock,
          rawStatement: input.rawStatement
        });
      } else {
        input.primitives.push({
          kind: "arc",
          start,
          end: nextPoint,
          center,
          clockwise: input.state.interpolation === "clockwise-arc",
          apertureCode: input.state.currentApertureCode ?? 0,
          polarity: input.state.polarity,
          sourceBlock: input.sourceBlock,
          objectAttributeSetId: input.objectAttributeSetId
        });
      }
    }
  }

  input.state.currentPointMm = nextPoint;
  input.state.modalOperation = "draw";
}

function handleExtended(input: {
  statement: string;
  sourceBlock: number;
  state: GerberParserState;
  apertures: GerberApertureDefinition[];
  macroNames: Set<string>;
  macroRaw: Map<string, string>;
  diagnostics: GerberDiagnostic[];
  x2AttributeStatements: string[];
  apertureAttributeSetId?: string;
  onAttributeCommand: (statement: string, sourceBlock: number) => void;
}) {
  const { statement, state } = input;

  if (statement.startsWith("FS")) {
    const format = parseFormat(statement);
    if (format) state.format = format;
    else {
      addDiagnostic(input.diagnostics, {
        code: "missing-coordinate-format",
        severity: "error",
        message: "Format specification is malformed.",
        sourceBlock: input.sourceBlock,
        rawStatement: statement
      });
    }
    return;
  }

  if (statement.startsWith("MOMM")) {
    state.units = "mm";
    return;
  }

  if (statement.startsWith("MOIN")) {
    state.units = "inch";
    return;
  }

  if (statement.startsWith("LPD")) {
    state.polarity = "dark";
    return;
  }

  if (statement.startsWith("LPC")) {
    state.polarity = "clear";
    return;
  }

  if (statement.startsWith("AM")) {
    const macroName = parseMacroName(statement);
    if (macroName) {
      input.macroNames.add(macroName);
      input.macroRaw.set(macroName, statement);
      addDiagnostic(input.diagnostics, {
        code: "unsupported-aperture-macro",
        severity: "info",
        message: `Aperture macro ${macroName} detected and preserved; macro evaluation is deferred.`,
        sourceBlock: input.sourceBlock
      });
    }
    return;
  }

  if (statement.startsWith("ADD")) {
    if (input.apertures.length >= GERBER_PARSER_LIMITS.maxApertures) {
      addDiagnostic(input.diagnostics, {
        code: "file-size-or-block-count-limit",
        severity: "error",
        message: "Aperture limit reached; remaining aperture definitions are ignored.",
        sourceBlock: input.sourceBlock
      });
      return;
    }

    const aperture = parseApertureDefinition({
      statement,
      units: state.units,
      macroNames: input.macroNames,
      sourceBlock: input.sourceBlock,
      diagnostics: input.diagnostics,
      maxDiagnostics: GERBER_PARSER_LIMITS.maxDiagnostics
    });
    if (aperture) input.apertures.push({
      ...aperture,
      apertureAttributeSetId: input.apertureAttributeSetId
    });
    return;
  }

  if (/^T[FAOD]/.test(statement)) {
    input.x2AttributeStatements.push(statement);
    input.onAttributeCommand(statement, input.sourceBlock);
    return;
  }

  addDiagnostic(input.diagnostics, {
    code: "unsupported-statement",
    severity: "info",
    message: "Extended Gerber statement is not interpreted by the D2 parser.",
    sourceBlock: input.sourceBlock,
    rawStatement: statement
  });
}

function updateModalFromToken(input: {
  token: string;
  state: GerberParserState;
  apertures: readonly GerberApertureDefinition[];
  primitives: GerberGeometryPrimitive[];
  sourceBlock: number;
  rawStatement: string;
  diagnostics: GerberDiagnostic[];
  endSeen: { value: boolean };
  regionObjectAttributeSetId?: string;
}) {
  const { token, state } = input;

  if (token === "G01") state.interpolation = "linear";
  else if (token === "G02") state.interpolation = "clockwise-arc";
  else if (token === "G03") state.interpolation = "counterclockwise-arc";
  else if (token === "G70") state.units = "inch";
  else if (token === "G71") state.units = "mm";
  else if (token === "G74") state.quadrantMode = "single";
  else if (token === "G75") state.quadrantMode = "multi";
  else if (token === "G90" && state.format) state.format = { ...state.format, coordinateMode: "absolute" };
  else if (token === "G91" && state.format) state.format = { ...state.format, coordinateMode: "incremental" };
  else if (token === "G36") {
    if (state.regionActive) {
      addDiagnostic(input.diagnostics, {
        code: "unexpected-region-start",
        severity: "warning",
        message: "Region begin encountered while another region is active.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    }
    state.regionActive = true;
    state.currentRegionStartBlock = input.sourceBlock;
    state.currentRegionContours = [];
    state.currentRegionObjectAttributeSetId = input.regionObjectAttributeSetId;
  } else if (token === "G37") {
    if (!state.regionActive) {
      addDiagnostic(input.diagnostics, {
        code: "unexpected-region-end",
        severity: "warning",
        message: "Region end encountered without an active region.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
      return;
    }

    const contours = state.currentRegionContours.filter((contour) => contour.segments.length > 0);
    if (contours.length === 0) {
      addDiagnostic(input.diagnostics, {
        code: "empty-region",
        severity: "warning",
        message: "Region closed without contour segments.",
        sourceBlock: input.sourceBlock,
        rawStatement: input.rawStatement
      });
    } else {
      input.primitives.push({
        kind: "region",
        contours,
        polarity: state.polarity,
        sourceBlockStart: state.currentRegionStartBlock ?? input.sourceBlock,
        sourceBlockEnd: input.sourceBlock,
        objectAttributeSetId: state.currentRegionObjectAttributeSetId
      });
    }

    state.regionActive = false;
    state.currentRegionStartBlock = null;
    state.currentRegionObjectAttributeSetId = undefined;
    state.currentRegionContours = [];
  } else if (token.startsWith("D")) {
    const code = Number(token.slice(1));
    if (code >= 10) {
      if (!input.apertures.some((aperture) => aperture.code === code)) {
        addDiagnostic(input.diagnostics, {
          code: "unknown-aperture-selection",
          severity: "warning",
          message: `Aperture D${code} was selected before a supported definition was parsed.`,
          sourceBlock: input.sourceBlock,
          rawStatement: input.rawStatement
        });
      }
      state.currentApertureCode = code;
    }
  } else if (token === "M02") {
    input.endSeen.value = true;
  } else if (token.startsWith("G04")) {
    return;
  } else if (token.startsWith("G")) {
    addDiagnostic(input.diagnostics, {
      code: "unsupported-statement",
      severity: "info",
      message: `Gerber command ${token} is not interpreted by the D2 parser.`,
      sourceBlock: input.sourceBlock,
      rawStatement: input.rawStatement
    });
  }
}

export function parseGerber(
  source: string,
  sourceFileId: string,
  sourceFileName: string,
  sourceFile?: ClassifiedFile
): GerberParseResult {
  const diagnostics: GerberDiagnostic[] = [];
  const byteLength = new TextEncoder().encode(source).byteLength;

  if (byteLength > GERBER_PARSER_LIMITS.maxSourceBytes) {
    return {
      sourceFileId,
      sourceFileName,
      sourceKind: sourceKindFor(sourceFile),
      sourcePackageId: sourceFile?.sourcePackageId,
      sourcePackageName: sourceFile?.sourcePackageName,
      sourceRelativePath: sourceFile?.sourceRelativePath,
      status: "failed",
      units: null,
      coordinateFormat: null,
      apertures: [],
      primitives: [],
      boundsMm: null,
      geometryCoverage: "unavailable",
      summary: {
        blockCount: 0,
        apertureCount: 0,
        lineCount: 0,
        arcCount: 0,
        flashCount: 0,
        regionCount: 0,
        darkPrimitiveCount: 0,
        clearPrimitiveCount: 0,
        x2AttributeCount: 0,
        unsupportedMacroCount: 0
      },
      x2: emptyX2Result(),
      diagnostics: [{
        code: "file-size-or-block-count-limit",
        severity: "error",
        message: `Gerber source exceeds ${GERBER_PARSER_LIMITS.maxSourceBytes} bytes.`
      }]
    };
  }

  const tokenized = tokenizeGerber(source, GERBER_PARSER_LIMITS.maxBlocks);
  if (tokenized.truncated) {
    addDiagnostic(diagnostics, {
      code: "file-size-or-block-count-limit",
      severity: "error",
      message: `Gerber block count exceeded ${GERBER_PARSER_LIMITS.maxBlocks}; parsing stopped.`
    });
  }

  const state = initialState();
  const apertures: GerberApertureDefinition[] = [];
  const primitives: GerberGeometryPrimitive[] = [];
  const macroNames = new Set<string>();
  const macroRaw = new Map<string, string>();
  const x2AttributeStatements: string[] = [];
  const fileAttributeHistory: GerberRawAttribute[] = [];
  const endSeen = { value: false };
  let x2CommandCount = 0;
  let x2DeletionCommandCount = 0;
  let malformedAttributeCount = 0;
  const apertureAttributeInterner = createAttributeSetInterner("aperture-attrs", interpretApertureAttributes);
  const objectAttributeInterner = createAttributeSetInterner("object-attrs", interpretObjectAttributes);

  function internApertureAttributes() {
    return apertureAttributeInterner.intern(rawAttributesArray(state.activeApertureAttributes));
  }

  function internObjectAttributes() {
    return objectAttributeInterner.intern(rawAttributesArray(state.activeObjectAttributes));
  }

  function applyAttributeCommand(statement: string, sourceBlock: number) {
    const beforeDiagnostics = diagnostics.length;
    const parsed = parseGerberAttributeCommand(statement, {
      sourceBlock,
      rawStatement: statement,
      diagnostics,
      maxDiagnostics: GERBER_PARSER_LIMITS.maxDiagnostics
    });

    if (!parsed) {
      malformedAttributeCount += diagnostics.length > beforeDiagnostics ? 1 : 0;
      return;
    }

    x2CommandCount += 1;

    if (parsed.command === "TD") {
      x2DeletionCommandCount += 1;
      if (!parsed.normalizedName) {
        state.activeApertureAttributes.clear();
        state.activeObjectAttributes.clear();
        return;
      }

      const removedAperture = state.activeApertureAttributes.delete(parsed.normalizedName);
      const removedObject = state.activeObjectAttributes.delete(parsed.normalizedName);
      if (!removedAperture && !removedObject) {
        addDiagnostic(diagnostics, {
          code: "x2-attribute-delete-miss",
          severity: "info",
          message: `X2 TD requested deletion of inactive attribute '${parsed.name}'.`,
          sourceBlock,
          rawStatement: statement
        });
      }
      return;
    }

    if (parsed.command === "TF") {
      fileAttributeHistory.push(parsed);
      state.fileAttributes.set(parsed.normalizedName, parsed);
      return;
    }

    if (parsed.command === "TA") {
      state.activeApertureAttributes.set(parsed.normalizedName, parsed);
      return;
    }

    state.activeObjectAttributes.set(parsed.normalizedName, parsed);
  }

  tokenized.blocks.forEach((block) => {
    if (primitives.length >= GERBER_PARSER_LIMITS.maxPrimitives) {
      addDiagnostic(diagnostics, {
        code: "file-size-or-block-count-limit",
        severity: "error",
        message: `Primitive limit ${GERBER_PARSER_LIMITS.maxPrimitives} reached; remaining geometry is ignored.`,
        sourceBlock: block.index
      });
      return;
    }

    const compactStatement = block.statement.replace(/\s+/g, "");
    const statement = block.extended && compactStatement.startsWith("AM")
      ? block.statement.trim()
      : block.statement.toUpperCase().startsWith("G04")
        ? block.statement
        : compactStatement.replace(/\*+$/, "");

    if (block.extended) {
      handleExtended({
        statement,
        sourceBlock: block.index,
        state,
        apertures,
        macroNames,
        macroRaw,
        diagnostics,
        x2AttributeStatements,
        apertureAttributeSetId: internApertureAttributes(),
        onAttributeCommand: applyAttributeCommand
      });
      return;
    }

    const parsed = parseCommandBlock(statement, (token) =>
      updateModalFromToken({
        token,
        state,
        apertures,
        primitives,
        sourceBlock: block.index,
        rawStatement: block.raw,
        diagnostics,
        endSeen,
        regionObjectAttributeSetId: internObjectAttributes()
      })
    );

    handleOperation({
      parsed,
      state,
      apertures,
      primitives,
      objectAttributeSetId: internObjectAttributes(),
      sourceBlock: block.index,
      rawStatement: block.raw,
      diagnostics
    });
  });

  if (!state.format) {
    addDiagnostic(diagnostics, {
      code: "missing-coordinate-format",
      severity: "error",
      message: "No usable %FS coordinate format was found."
    });
  }

  if (!state.units) {
    addDiagnostic(diagnostics, {
      code: "missing-units",
      severity: "error",
      message: "No Gerber unit declaration was found."
    });
  }

  if (state.regionActive) {
    addDiagnostic(diagnostics, {
      code: "unclosed-region",
      severity: "warning",
      message: "End of file reached while a region was still active.",
      sourceBlock: state.currentRegionStartBlock ?? undefined
    });
  }

  if (!endSeen.value) {
    addDiagnostic(diagnostics, {
      code: "missing-m02",
      severity: "warning",
      message: "Gerber end-of-file command M02 was not found."
    });
  }

  const unsupportedMacroCount = apertures.filter((aperture) => aperture.kind === "macro").length;
  const boundsMm = calculateGerberBounds({ primitives, apertures });

  if (primitives.length === 0) {
    addDiagnostic(diagnostics, {
      code: "empty-geometry",
      severity: "warning",
      message: "No supported Gerber geometry primitives were parsed."
    });
  }

  if (!boundsMm && primitives.length > 0) {
    addDiagnostic(diagnostics, {
      code: "partial-bounding-box",
      severity: "warning",
      message: "Bounds are unavailable because supported geometry was insufficient."
    });
  } else if (unsupportedMacroCount > 0) {
    addDiagnostic(diagnostics, {
      code: "partial-bounding-box",
      severity: "warning",
      message: "Bounds exclude unsupported aperture macro geometry."
    });
  }

  const lineCount = primitives.filter((primitive) => primitive.kind === "line").length;
  const arcCount = primitives.filter((primitive) => primitive.kind === "arc").length;
  const flashCount = primitives.filter((primitive) => primitive.kind === "flash").length;
  const regionCount = primitives.filter((primitive) => primitive.kind === "region").length;
  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const geometryCoverage = primitives.length === 0
    ? "unavailable"
    : unsupportedMacroCount > 0 || diagnostics.some((diagnostic) => diagnostic.code === "partial-bounding-box")
      ? "partial"
      : "complete-for-supported-features";
  const fileAttributes = interpretFileAttributes(
    fileAttributeHistory,
    diagnostics,
    GERBER_PARSER_LIMITS.maxDiagnostics
  );
  const x2 = {
    detected: x2CommandCount > 0,
    fileAttributes,
    apertureAttributeSets: apertureAttributeInterner.all(),
    objectAttributeSets: objectAttributeInterner.all(),
    summary: summarizeGerberX2({
      fileAttributes,
      apertureAttributeSets: apertureAttributeInterner.all(),
      objectAttributeSets: objectAttributeInterner.all(),
      commandCount: x2CommandCount,
      deletionCommandCount: x2DeletionCommandCount,
      malformedAttributeCount,
      attributedApertureCount: apertures.filter((aperture) => aperture.apertureAttributeSetId).length,
      attributedPrimitiveCount: primitives.filter((primitive) => primitive.objectAttributeSetId).length
    })
  };

  return {
    sourceFileId,
    sourceFileName,
    sourceKind: sourceKindFor(sourceFile),
    sourcePackageId: sourceFile?.sourcePackageId,
    sourcePackageName: sourceFile?.sourcePackageName,
    sourceRelativePath: sourceFile?.sourceRelativePath,
    status: errorCount > 0 ? "failed" : diagnostics.length > 0 ? "parsed-with-warnings" : "parsed",
    units: state.units,
    coordinateFormat: state.format,
    apertures,
    primitives,
    boundsMm,
    geometryCoverage,
    summary: {
      blockCount: tokenized.blocks.length,
      apertureCount: apertures.length,
      lineCount,
      arcCount,
      flashCount,
      regionCount,
      darkPrimitiveCount: primitives.filter((primitive) => primitive.polarity === "dark").length,
      clearPrimitiveCount: primitives.filter((primitive) => primitive.polarity === "clear").length,
      x2AttributeCount: x2AttributeStatements.length,
      unsupportedMacroCount
    },
    x2,
    diagnostics
  };
}
