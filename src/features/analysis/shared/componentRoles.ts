import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { BomParseResult } from "../../parsers/bom/bomTypes";
import type { KiCadPcbFootprint } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicSymbol } from "../../parsers/kicad-schematic/kicadSchematicTypes";
import { evidence } from "./analysisEvidence";

type ComponentSource = Readonly<{
  reference?: string;
  value?: string;
  footprint?: string;
  metadata?: string;
}>;

function prefixOf(reference: string): string {
  const match = reference.toUpperCase().match(/^[A-Z]+/);
  return match?.[0] ?? "";
}

function classify(source: ComponentSource): ComponentRoleCandidate | undefined {
  const reference = source.reference?.trim();
  if (!reference) {
    return undefined;
  }

  const prefix = prefixOf(reference);
  const text = `${source.value ?? ""} ${source.footprint ?? ""} ${source.metadata ?? ""}`.toUpperCase();
  const role =
    prefix === "U" || prefix === "IC"
      ? text.match(/MCU|CPU|FPGA|ESP|STM|ATMEGA|PIC|RP2040/)
        ? "programmable-ic"
        : text.match(/REG|LDO|BUCK|BOOST|CONVERTER/)
          ? "regulator-power-ic"
          : "ic"
      : prefix === "C"
        ? "capacitor"
        : prefix === "R"
          ? "resistor"
          : prefix === "L" || prefix === "FB"
            ? "inductor-ferrite"
            : prefix === "Y" || prefix === "X" || prefix === "XTAL" || prefix === "OSC"
              ? "crystal-oscillator"
              : prefix === "J" || prefix === "P" || prefix === "CN"
                ? "connector"
                : prefix === "D" || prefix === "TVS" || prefix === "ESD"
                  ? "diode-protection"
                  : text.match(/REGULATOR|LDO|BUCK|BOOST/)
                    ? "regulator-power-ic"
                    : "unknown";

  const metadataEvidence = [
    `Reference ${reference} has prefix ${prefix || "unavailable"}.`,
    source.value ? `Value metadata: ${source.value}.` : undefined,
    source.footprint ? `Footprint metadata: ${source.footprint}.` : undefined
  ].filter(Boolean) as string[];

  return {
    reference,
    value: source.value,
    footprint: source.footprint,
    role,
    confidence: role === "unknown" ? "inferred-low" : "inferred-high",
    evidence: [
      evidence("heuristic", metadataEvidence.join(" "), role === "unknown" ? "inferred-low" : "inferred-high")
    ],
    ambiguous: role === "unknown"
  };
}

function mergeRole(existing: ComponentRoleCandidate, next: ComponentRoleCandidate): ComponentRoleCandidate {
  const role = existing.role === "unknown" ? next.role : existing.role;
  const ambiguous = existing.role !== "unknown" && next.role !== "unknown" && existing.role !== next.role;

  return {
    reference: existing.reference,
    value: existing.value ?? next.value,
    footprint: existing.footprint ?? next.footprint,
    role: ambiguous ? existing.role : role,
    confidence: ambiguous ? "inferred-medium" : existing.confidence,
    evidence: [...existing.evidence, ...next.evidence],
    ambiguous
  };
}

export function buildComponentRoles(input: {
  footprints?: readonly KiCadPcbFootprint[];
  symbols?: readonly KiCadSchematicSymbol[];
  bom?: BomParseResult;
}): readonly ComponentRoleCandidate[] {
  const roles = new Map<string, ComponentRoleCandidate>();

  const add = (candidate: ComponentRoleCandidate | undefined) => {
    if (!candidate) {
      return;
    }
    const key = candidate.reference.toUpperCase();
    roles.set(key, roles.has(key) ? mergeRole(roles.get(key)!, candidate) : candidate);
  };

  input.footprints?.forEach((footprint) =>
    add(classify({
      reference: footprint.reference,
      value: footprint.value,
      footprint: footprint.footprintName,
      metadata: `${footprint.description ?? ""} ${footprint.tags ?? ""}`
    }))
  );

  input.symbols?.forEach((symbol) =>
    add(classify({
      reference: symbol.reference,
      value: symbol.value,
      footprint: symbol.footprint,
      metadata: `${symbol.libId ?? ""} ${symbol.description ?? ""}`
    }))
  );

  input.bom?.rows.forEach((row) => {
    row.referenceDesignators.forEach((reference) =>
      add(classify({
        reference,
        value: row.value,
        footprint: row.footprint,
        metadata: `${row.description ?? ""} ${row.manufacturerPartNumber ?? ""}`
      }))
    );
  });

  return Array.from(roles.values()).sort((a, b) => a.reference.localeCompare(b.reference, undefined, { numeric: true }));
}
