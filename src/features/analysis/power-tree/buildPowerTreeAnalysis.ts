import type { ComponentRoleCandidate } from "../../../domain/analysis";
import type { PowerProtectionCandidate, PowerTreeAnalysisResult } from "../../../domain/power";
import type { NormalizedNetInventory } from "../../../domain/nets";
import type { KiCadPcbParseResult } from "../../parsers/kicad-pcb/kicadPcbTypes";
import type { BomParseResult } from "../../parsers/bom/bomTypes";
import type { DecouplingAnalysisResult } from "../../../domain/analysis";
import { evidence, issue } from "../shared/analysisEvidence";
import { buildPowerBudgets } from "./buildPowerBudget";
import { buildPowerRails } from "./buildPowerRails";
import { detectPowerInputs } from "./detectPowerInputs";
import { detectRegulators } from "./detectRegulators";
import { buildPowerTreeFindings } from "./powerTreeFindings";

export function buildPowerTreeAnalysis(input: {
  pcb?: KiCadPcbParseResult;
  bom?: BomParseResult;
  inventory: NormalizedNetInventory;
  roles: readonly ComponentRoleCandidate[];
  powerNetNames: readonly string[];
  decoupling: DecouplingAnalysisResult;
}): PowerTreeAnalysisResult {
  const inputs = detectPowerInputs({ pcb: input.pcb, roles: input.roles, powerNetNames: input.powerNetNames });
  const regulators = detectRegulators({ pcb: input.pcb, roles: input.roles, decoupling: input.decoupling, inventory: input.inventory });
  const protection: PowerProtectionCandidate[] = input.roles
    .filter((role) => role.role === "diode-protection" || /FUSE|PTC|POLYFUSE|TVS|ESD|DIODE/i.test(`${role.reference} ${role.value ?? ""} ${role.footprint ?? ""}`))
    .map((role) => {
      const footprint = input.pcb?.footprints.find((item) => item.reference?.toUpperCase() === role.reference.toUpperCase());
      return {
        reference: role.reference,
        value: role.value,
        footprint: role.footprint,
        connectedNets: footprint?.padNetNames ?? [],
        protectionType: /FUSE|PTC|POLYFUSE/i.test(`${role.value ?? ""} ${role.footprint ?? ""}`) ? "fuse" : role.role === "diode-protection" ? "tvs-esd" : "unknown-protection",
        confidence: "inferred-medium",
        evidence: role.evidence,
        limitations: ["Protection role is inferred from reference/value/footprint metadata and is not validated against schematic intent."]
      };
    });
  const rails = buildPowerRails({ pcb: input.pcb, inventory: input.inventory, roles: input.roles, decoupling: input.decoupling, regulators, inputs });
  const budgets = buildPowerBudgets(rails, input.bom);
  const findings = [
    ...buildPowerTreeFindings({ rails, regulators }),
    ...budgets.filter((budget) => budget.estimatedCurrent === "unknown").map((budget) =>
      issue({
        id: `power-budget-unknown-${budget.railName}`,
        type: "analysis-limitation",
        title: `${budget.railName} current cannot be estimated`,
        severity: "informational",
        confidence: "missing-data",
        affectedNet: budget.railName,
        evidence: [evidence("bom", "No explicit current rating was found in parsed BOM fields.", "missing-data")],
        whyItMatters: "Power budget requires component-level current data before regulator margin or thermal review.",
        recommendation: "Provide BOM current ratings or datasheet-derived load currents.",
        limitations: budget.limitations,
        requiredFilesForStrongerValidation: ["BOM with current ratings", "component datasheets", "regulator part numbers"]
      })
    )
  ];

  return {
    available: rails.length > 0 || regulators.length > 0 || inputs.length > 0,
    inputs,
    protection,
    regulators,
    rails,
    budgets,
    paths: [],
    nodes: [
      ...inputs.map((item) => ({ id: `input-${item.netName}-${item.reference ?? "net"}`, label: item.reference ? `${item.reference} ${item.netName}` : item.netName, kind: "input" as const, confidence: item.confidence, evidence: item.evidence })),
      ...regulators.map((item) => ({ id: `regulator-${item.reference}`, label: item.reference, kind: "regulator" as const, confidence: item.confidence, evidence: item.evidence })),
      ...rails.map((item) => ({ id: `rail-${item.name}`, label: item.name, kind: "rail" as const, confidence: item.confidence, evidence: item.evidence }))
    ],
    findings,
    limitations: [
      "Power tree analysis is evidence-based and does not verify regulator sizing, thermal margin, or datasheet correctness.",
      "Current estimates are unknown unless explicit current values are present in parsed files."
    ],
    requiredFilesForStrongerValidation: [".kicad_sch", "PCB pad-net data", "BOM with current ratings", "regulator part numbers"]
  };
}
