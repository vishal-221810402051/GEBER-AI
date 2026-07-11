import type {
  NormalizedNet,
  NormalizedNetDiagnostic,
  NormalizedNetInventory,
  NormalizedNetSource
} from "../../domain";
import type { KiCadPcbParseResult } from "../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../parsers/kicad-schematic/kicadSchematicTypes";
import { buildInventoryDiagnostics } from "./buildNetDiagnostics";
import { classifyNet } from "./classifyNet";
import { summarizeNetInventory } from "./summarizeNetInventory";
import type { NetSourceAccumulator } from "./netExplorerTypes";

function getOrCreate(map: Map<string, NetSourceAccumulator>, name: string): NetSourceAccumulator {
  const key = name || "(unnamed)";
  const existing = map.get(key);

  if (existing) {
    return existing;
  }

  const next: NetSourceAccumulator = {
    name: key,
    sources: new Set<NormalizedNetSource>(),
    evidence: [],
    connectedPcbFootprints: new Set(),
    connectedPcbPads: new Set(),
    pcbSegmentCount: 0,
    pcbViaCount: 0,
    pcbZoneCount: 0,
    schematicLabelCount: 0,
    schematicWirePrimitiveCount: 0,
    relatedSchematicLabels: new Set()
  };
  map.set(key, next);
  return next;
}

export function buildNetInventory(input: {
  pcb?: KiCadPcbParseResult;
  schematic?: KiCadSchematicParseResult;
}): NormalizedNetInventory {
  const map = new Map<string, NetSourceAccumulator>();
  const pcbNetById = new Map(input.pcb?.nets.map((net) => [net.id, net]) ?? []);
  const perNetDiagnostics: Record<string, NormalizedNetDiagnostic[]> = {};

  input.pcb?.nets.forEach((net) => {
    const item = getOrCreate(map, net.name);
    item.sources.add("pcb-layout");
    item.relatedPcbNetDeclaration = `${net.id}: ${net.name}`;
    item.evidence.push(`Net ${net.name || "(unnamed)"} was declared in .kicad_pcb.`);
  });

  input.pcb?.footprints.forEach((footprint) => {
    footprint.pads.forEach((pad) => {
      const netName = pad.netName ?? (pad.netId ? pcbNetById.get(pad.netId)?.name : undefined);

      if (!netName && pad.netId) {
        const key = `unknown-net-id-${pad.netId}`;
        perNetDiagnostics[key] = [
          ...(perNetDiagnostics[key] ?? []),
          {
            id: `${key}-pad`,
            severity: "medium",
            confidence: "direct",
            message:
              "PCB pad references a net ID not found in declarations. Not a validation failure."
          }
        ];
        return;
      }

      if (!netName) {
        return;
      }

      const item = getOrCreate(map, netName);
      item.sources.add("pcb-layout");
      item.connectedPcbFootprints.add(footprint.reference ?? footprint.footprintName);
      item.connectedPcbPads.add(`${footprint.reference ?? footprint.footprintName}:${pad.number}`);
      item.evidence.push(`Net ${netName} is connected to PCB pad ${pad.number}.`);
    });
  });

  input.pcb?.trackSegments.forEach((segment) => {
    const netName = segment.netId ? pcbNetById.get(segment.netId)?.name : undefined;
    if (netName) {
      const item = getOrCreate(map, netName);
      item.pcbSegmentCount += 1;
      item.evidence.push("Net has a track segment in PCB layout.");
    }
  });

  input.pcb?.vias.forEach((via) => {
    const netName = via.netId ? pcbNetById.get(via.netId)?.name : undefined;
    if (netName) {
      const item = getOrCreate(map, netName);
      item.pcbViaCount += 1;
      item.evidence.push("Net has a via in PCB layout.");
    }
  });

  input.pcb?.zones.forEach((zone) => {
    const netName = zone.netName ?? (zone.netId ? pcbNetById.get(zone.netId)?.name : undefined);
    if (netName) {
      const item = getOrCreate(map, netName);
      item.pcbZoneCount += 1;
      item.evidence.push("Net has a zone in PCB layout.");
    }
  });

  input.schematic?.labels.forEach((label) => {
    const item = getOrCreate(map, label.name);
    const source: NormalizedNetSource =
      label.kind === "global_label"
        ? "schematic-global-label"
        : label.kind === "hierarchical_label"
          ? "schematic-hierarchical-label"
          : "schematic-label";
    item.sources.add(source);
    item.schematicLabelCount += 1;
    item.relatedSchematicLabels.add(label.name);
    item.evidence.push(`Net ${label.name} appears as a schematic label.`);
  });

  const nets = Array.from(map.values()).map((item, index): NormalizedNet => {
    const classification = classifyNet(item.name);
    const diagnostics: NormalizedNetDiagnostic[] = [...(perNetDiagnostics[item.name] ?? [])];

    if (classification.classification === "Unknown") {
      diagnostics.push({
        id: `net-${index}-unknown-classification`,
        severity: "info",
        confidence: classification.confidence,
        message: "Unknown classification. Classification is name-based and not electrical validation."
      });
    }

    if (!item.sources.has("pcb-layout")) {
      diagnostics.push({
        id: `net-${index}-not-in-pcb`,
        severity: "info",
        confidence: "direct",
        message:
          "Name not observed in PCB layout source. Cross-source comparison is informational only and not a validation failure."
      });
    }

    if (
      !item.sources.has("schematic-label") &&
      !item.sources.has("schematic-global-label") &&
      !item.sources.has("schematic-hierarchical-label")
    ) {
      diagnostics.push({
        id: `net-${index}-not-in-schematic-labels`,
        severity: "info",
        confidence: "direct",
        message:
          "Name not observed in schematic labels. Full schematic-to-Gerber validation is not implemented yet."
      });
    }

    return {
      id: `net-${index}`,
      name: item.name,
      sources: Array.from(item.sources),
      classification: classification.classification,
      classificationConfidence: classification.confidence,
      classificationEvidence: classification.evidence,
      classificationReason: classification.reason,
      classificationIsInferred: classification.inferred,
      evidence: [classification.evidence, ...item.evidence],
      connectedPcbFootprints: Array.from(item.connectedPcbFootprints),
      connectedPcbPads: Array.from(item.connectedPcbPads),
      pcbSegmentCount: item.pcbSegmentCount,
      pcbViaCount: item.pcbViaCount,
      pcbZoneCount: item.pcbZoneCount,
      schematicLabelCount: item.schematicLabelCount,
      schematicWirePrimitiveCount: input.schematic?.wires.length ?? 0,
      relatedSchematicLabels: Array.from(item.relatedSchematicLabels),
      relatedPcbNetDeclaration: item.relatedPcbNetDeclaration,
      diagnostics,
      limitations: [
        "Classification is deterministic and name-based.",
        "Electrical validation is not implemented yet.",
        "Schematic-to-Gerber validation is not implemented yet."
      ]
    };
  });

  const inventoryDiagnostics = buildInventoryDiagnostics(nets);

  return {
    available: nets.length > 0,
    nets,
    summary: summarizeNetInventory(nets),
    diagnostics: inventoryDiagnostics,
    limitations: [
      "Phase 7 classification is deterministic and name-based.",
      "Cross-source observations are informational only.",
      "Electrical validation is not implemented yet."
    ]
  };
}
