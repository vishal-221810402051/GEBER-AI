import type { GerberDiagnostic } from "./gerberTypes";
import {
  GERBER_ATTRIBUTE_LIMITS,
  type GerberApertureAttributes,
  type GerberAttributeParserContext,
  type GerberAttributeSet,
  type GerberFileAttributes,
  type GerberObjectAttributes,
  type GerberParsedAttributeCommand,
  type GerberRawAttribute
} from "./gerberAttributeTypes";

function addDiagnostic(
  diagnostics: GerberDiagnostic[],
  diagnostic: GerberDiagnostic,
  maxDiagnostics: number
) {
  if (diagnostics.length < maxDiagnostics) {
    diagnostics.push(diagnostic);
  }
}

export function normalizeAttributeName(name: string) {
  return name.toLowerCase();
}

function splitAttributeFields(input: string, context: GerberAttributeParserContext): readonly string[] | null {
  const fields: string[] = [];
  let current = "";
  let escaping = false;

  for (const char of input) {
    if (escaping) {
      if (char !== "," && char !== "\\" && char !== "*") {
        addDiagnostic(context.diagnostics, {
          code: "malformed-x2-attribute",
          severity: "warning",
          message: "Malformed X2 attribute escape sequence.",
          sourceBlock: context.sourceBlock,
          rawStatement: context.rawStatement
        }, context.maxDiagnostics);
      }
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === ",") {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (escaping) {
    addDiagnostic(context.diagnostics, {
      code: "malformed-x2-attribute",
      severity: "warning",
      message: "X2 attribute ends with an unfinished escape sequence.",
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    }, context.maxDiagnostics);
    return null;
  }

  fields.push(current);
  return fields;
}

export function parseGerberAttributeCommand(
  statement: string,
  context: GerberAttributeParserContext
): GerberParsedAttributeCommand | null {
  const command = statement.slice(0, 2);
  const body = statement.slice(2);

  if (command !== "TF" && command !== "TA" && command !== "TO" && command !== "TD") {
    return null;
  }

  if (command === "TD") {
    const name = body.length ? body : null;
    if (name && name.length > GERBER_ATTRIBUTE_LIMITS.maxAttributeNameLength) {
      addDiagnostic(context.diagnostics, {
        code: "x2-attribute-limit",
        severity: "warning",
        message: "X2 attribute deletion name exceeds the supported length.",
        sourceBlock: context.sourceBlock,
        rawStatement: context.rawStatement
      }, context.maxDiagnostics);
      return null;
    }

    return {
      command: "TD",
      name,
      normalizedName: name ? normalizeAttributeName(name) : null,
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    };
  }

  const fields = splitAttributeFields(body, context);
  if (!fields) return null;

  const [name, ...values] = fields;
  if (!name) {
    addDiagnostic(context.diagnostics, {
      code: "missing-x2-attribute-name",
      severity: "warning",
      message: "X2 attribute command is missing an attribute name.",
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    }, context.maxDiagnostics);
    return null;
  }

  if (name.length > GERBER_ATTRIBUTE_LIMITS.maxAttributeNameLength) {
    addDiagnostic(context.diagnostics, {
      code: "x2-attribute-limit",
      severity: "warning",
      message: "X2 attribute name exceeds the supported length.",
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    }, context.maxDiagnostics);
    return null;
  }

  if (values.length > GERBER_ATTRIBUTE_LIMITS.maxValuesPerAttribute) {
    addDiagnostic(context.diagnostics, {
      code: "x2-attribute-limit",
      severity: "warning",
      message: "X2 attribute has too many values.",
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    }, context.maxDiagnostics);
    return null;
  }

  if (values.some((value) => value.length > GERBER_ATTRIBUTE_LIMITS.maxAttributeValueLength)) {
    addDiagnostic(context.diagnostics, {
      code: "x2-attribute-limit",
      severity: "warning",
      message: "X2 attribute value exceeds the supported length.",
      sourceBlock: context.sourceBlock,
      rawStatement: context.rawStatement
    }, context.maxDiagnostics);
    return null;
  }

  return {
    scope: command === "TF" ? "file" : command === "TA" ? "aperture" : "object",
    command,
    name,
    normalizedName: normalizeAttributeName(name),
    values,
    sourceBlock: context.sourceBlock,
    rawStatement: context.rawStatement
  };
}

export function mapAttributesByName(attributes: readonly GerberRawAttribute[]) {
  return new Map(attributes.map((attribute) => [attribute.normalizedName, attribute]));
}

function unknownAttributes(
  attributes: readonly GerberRawAttribute[],
  knownNames: readonly string[]
) {
  const known = new Set(knownNames);
  return attributes.filter((attribute) => !known.has(attribute.normalizedName));
}

function parseDate(rawValue: string) {
  const timestamp = Date.parse(rawValue);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export function classifyFileFunction(attribute: GerberRawAttribute) {
  const rawFunction = attribute.values[0] ?? "";
  const rawModifiers = attribute.values.slice(1);
  const normalized = rawFunction.toLowerCase();
  const modifierText = rawModifiers.join(",").toLowerCase();
  const layerMatch = rawModifiers.join(",").match(/(?:L|Inr|Inner)?(\d+)/i);
  const side = /top/i.test(modifierText)
    ? "top" as const
    : /bottom|bot/i.test(modifierText)
      ? "bottom" as const
      : /inner|inr/i.test(modifierText)
        ? "inner" as const
        : undefined;

  return {
    rawFunction,
    rawModifiers,
    category: normalized.includes("copper")
      ? "copper" as const
      : normalized.includes("soldermask") || normalized.includes("solder-mask")
        ? "solder-mask" as const
        : normalized.includes("legend") || normalized.includes("silk")
          ? "legend" as const
          : normalized.includes("profile") || normalized.includes("outline")
            ? "profile" as const
            : normalized.includes("paste")
              ? "paste" as const
              : normalized.includes("fab")
                ? "fabrication" as const
                : normalized.includes("assembly")
                  ? "assembly" as const
                  : rawFunction
                    ? "other" as const
                    : "unknown" as const,
    side,
    layerNumber: layerMatch ? Number(layerMatch[1]) : undefined,
    confidence: "declared" as const,
    sourceBlock: attribute.sourceBlock
  };
}

export function interpretFileAttributes(
  attributes: readonly GerberRawAttribute[],
  diagnostics: GerberDiagnostic[],
  maxDiagnostics: number
): GerberFileAttributes {
  const map = mapAttributesByName(attributes);
  const duplicateNames = new Set<string>();
  attributes.forEach((attribute, index) => {
    if (attributes.findIndex((candidate) => candidate.normalizedName === attribute.normalizedName) !== index) {
      duplicateNames.add(attribute.normalizedName);
    }
  });
  duplicateNames.forEach((name) => {
    addDiagnostic(diagnostics, {
      code: "duplicate-x2-file-attribute",
      severity: "warning",
      message: `Duplicate X2 file attribute '${name}' encountered; the last value is used for typed interpretation.`
    }, maxDiagnostics);
  });

  const fileFunction = map.get(".filefunction");
  const filePolarity = map.get(".filepolarity");
  const part = map.get(".part");
  const generationSoftware = map.get(".generationsoftware");
  const creationDate = map.get(".creationdate");
  const projectId = map.get(".projectid");
  const md5 = map.get(".md5");
  const sameCoordinates = map.get(".samecoordinates");

  return {
    raw: attributes,
    fileFunction: fileFunction ? classifyFileFunction(fileFunction) : undefined,
    filePolarity: filePolarity ? {
      polarity: filePolarity.values[0] ?? "",
      sourceBlock: filePolarity.sourceBlock
    } : undefined,
    part: part ? {
      value: part.values[0] ?? "",
      sourceBlock: part.sourceBlock
    } : undefined,
    generationSoftware: generationSoftware ? {
      vendor: generationSoftware.values[0],
      application: generationSoftware.values[1],
      version: generationSoftware.values[2],
      rawValues: generationSoftware.values,
      sourceBlock: generationSoftware.sourceBlock
    } : undefined,
    creationDate: creationDate ? {
      rawValue: creationDate.values[0] ?? "",
      parsedIsoValue: parseDate(creationDate.values[0] ?? ""),
      sourceBlock: creationDate.sourceBlock
    } : undefined,
    projectId: projectId ? {
      rawValues: projectId.values,
      sourceBlock: projectId.sourceBlock
    } : undefined,
    md5: md5 ? {
      value: md5.values[0] ?? "",
      sourceBlock: md5.sourceBlock
    } : undefined,
    sameCoordinates: sameCoordinates ? {
      identifier: sameCoordinates.values[0] ?? "",
      sourceBlock: sameCoordinates.sourceBlock
    } : undefined,
    unknown: unknownAttributes(attributes, [
      ".filefunction",
      ".filepolarity",
      ".part",
      ".generationsoftware",
      ".creationdate",
      ".projectid",
      ".md5",
      ".samecoordinates"
    ])
  };
}

export function interpretApertureAttributes(
  attributes: readonly GerberRawAttribute[]
): GerberApertureAttributes {
  const map = mapAttributesByName(attributes);
  const apertureFunction = map.get(".aperfunction");
  const drillTolerance = map.get(".drilltolerance");
  const plus = drillTolerance?.values[0] === undefined ? undefined : Number(drillTolerance.values[0]);
  const minus = drillTolerance?.values[1] === undefined ? undefined : Number(drillTolerance.values[1]);

  return {
    raw: attributes,
    apertureFunction: apertureFunction ? {
      value: apertureFunction.values[0] ?? "",
      modifiers: apertureFunction.values.slice(1),
      sourceBlock: apertureFunction.sourceBlock
    } : undefined,
    drillTolerance: drillTolerance ? {
      plus: Number.isFinite(plus) ? plus : undefined,
      minus: Number.isFinite(minus) ? minus : undefined,
      rawValues: drillTolerance.values,
      sourceBlock: drillTolerance.sourceBlock
    } : undefined,
    unknown: unknownAttributes(attributes, [".aperfunction", ".drilltolerance"])
  };
}

export function interpretObjectAttributes(
  attributes: readonly GerberRawAttribute[]
): GerberObjectAttributes {
  const map = mapAttributesByName(attributes);
  const net = map.get(".n");
  const pin = map.get(".p");
  const component = map.get(".c");

  return {
    raw: attributes,
    net: net && net.values[0] ? {
      name: net.values[0],
      sourceBlock: net.sourceBlock
    } : undefined,
    pin: pin ? {
      componentReference: pin.values[0],
      pinNumber: pin.values[1],
      rawValues: pin.values,
      sourceBlock: pin.sourceBlock
    } : undefined,
    component: component && component.values[0] ? {
      reference: component.values[0],
      rawValues: component.values,
      sourceBlock: component.sourceBlock
    } : undefined,
    unknown: unknownAttributes(attributes, [".n", ".p", ".c"])
  };
}

function attributesKey(attributes: readonly GerberRawAttribute[]) {
  return attributes
    .slice()
    .sort((a, b) => a.normalizedName.localeCompare(b.normalizedName))
    .map((attribute) => `${attribute.normalizedName}\u001f${attribute.command}\u001f${attribute.values.join("\u001e")}`)
    .join("\u001d");
}

export function createAttributeSetInterner<TInterpreted>(
  prefix: string,
  interpret: (attributes: readonly GerberRawAttribute[]) => TInterpreted
) {
  const byKey = new Map<string, GerberAttributeSet<TInterpreted>>();
  const byId: Record<string, GerberAttributeSet<TInterpreted>> = {};

  return {
    intern(attributes: readonly GerberRawAttribute[]): string | undefined {
      if (attributes.length === 0) return undefined;
      const key = attributesKey(attributes);
      const existing = byKey.get(key);
      if (existing) return existing.id;

      if (byKey.size >= GERBER_ATTRIBUTE_LIMITS.maxAttributeSetCount) {
        return undefined;
      }

      const id = `${prefix}-${byKey.size + 1}`;
      const set = {
        id,
        raw: attributes.slice().sort((a, b) => a.normalizedName.localeCompare(b.normalizedName)),
        interpreted: interpret(attributes)
      };
      byKey.set(key, set);
      byId[id] = set;
      return id;
    },
    all(): Readonly<Record<string, GerberAttributeSet<TInterpreted>>> {
      return byId;
    },
    count() {
      return byKey.size;
    }
  };
}
