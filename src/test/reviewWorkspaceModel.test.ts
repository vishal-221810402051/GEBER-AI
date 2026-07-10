import { describe, expect, it } from "vitest";
import type { NormalizedPCBProject } from "../domain";
import { buildReviewWorkspaceModel } from "../features/review/reviewWorkspaceModel";

function project(overrides: Partial<NormalizedPCBProject> = {}): NormalizedPCBProject {
  return {
    id: "project-test",
    name: "Test Project",
    createdAt: "2026-07-08T00:00:00.000Z",
    updatedAt: "2026-07-08T00:00:00.000Z",
    selectedMode: "analyze",
    sourceFiles: [],
    fileCategories: [],
    completenessScore: 0,
    readinessLabel: "Insufficient",
    parserResult: {
      status: "waiting-for-files",
      stages: []
    },
    missingDataWarnings: [],
    directEvidence: [],
    inferredEvidence: [],
    assumptions: [],
    board: { status: "future-model", message: "No board." },
    schematic: { status: "future-model", message: "No schematic." },
    bom: { status: "future-model", message: "No BOM." },
    placement: { status: "future-model", message: "No placement." },
    netInventory: {
      available: false,
      nets: [],
      diagnostics: [],
      summary: {
        totalNets: 0,
        classifiedNets: 0,
        unknownNets: 0,
        powerNets: 0,
        groundNets: 0,
        communicationNets: 0,
        diagnosticsCount: 0
      }
    },
    analysis: {
      phase: "Phase 9",
      scope: "heuristic-placement-and-power-tree-analysis",
      fullValidationComplete: false,
      componentRoles: [],
      powerNets: [],
      groundNets: [],
      decoupling: {
        available: false,
        candidates: [],
        icPowerPins: [],
        findings: [],
        limitations: [],
        requiredFilesForStrongerValidation: []
      },
      pullResistors: {
        available: false,
        candidates: [],
        requirements: [],
        findings: [],
        limitations: [],
        requiredFilesForStrongerValidation: []
      },
      placement: {
        available: false,
        components: [],
        coordinateSourceSummary: {
          pcbOnly: 0,
          placementOnly: 0,
          both: 0,
          missingCoordinates: 0
        },
        proximity: [],
        findings: [],
        limitations: [],
        requiredFilesForStrongerValidation: []
      },
      powerTree: {
        available: false,
        rails: [],
        regulators: [],
        inputs: [],
        protection: [],
        paths: [],
        budgets: [],
        nodes: [],
        findings: [],
        limitations: [],
        requiredFilesForStrongerValidation: []
      },
      summary: {
        componentRoles: [],
        icCountReviewed: 0,
        decouplingEvidenceFound: 0,
        decouplingMissingEvidence: 0,
        pullUpCandidates: 0,
        pullDownCandidates: 0,
        biasWarnings: 0,
        confidenceLimitations: 0,
        placementComponentsReviewed: 0,
        placementFindings: 0,
        powerRailsDetected: 0,
        regulatorCandidates: 0,
        powerInputCandidates: 0,
        powerFindings: 0,
        unknownCurrentLoads: 0
      },
      limitations: []
    },
    firmware: {
      status: "future-model",
      message: "No firmware.",
      manual: {
        available: false,
        phase: "Phase 10",
        summary: {
          readiness: "not-usable",
          mcuCandidates: 0,
          pinMapEntries: 0,
          peripheralGroups: 0,
          connectorPinouts: 0,
          checklistItems: 0,
          limitations: 0
        },
        mcuCandidates: [],
        pinMap: [],
        peripherals: [],
        connectors: [],
        checklist: [],
        driverSuggestions: [],
        safetyNotes: [],
        bringUpSteps: [],
        findings: [],
        limitations: [],
        requiredFilesForStrongerValidation: []
      }
    },
    report: {
      status: "future-model",
      message: "No report."
    },
    ...overrides
  } as NormalizedPCBProject;
}

describe("buildReviewWorkspaceModel", () => {
  it("builds an honest empty workspace model", () => {
    const model = buildReviewWorkspaceModel(project());

    expect(model.hasProject).toBe(false);
    expect(model.files.total).toBe(0);
    expect(model.nextActions[0]?.title).toBe("Upload project files");
    expect(model.report.available).toBe(false);
  });

  it("summarizes report risks and preserves deterministic evidence IDs", () => {
    const model = buildReviewWorkspaceModel(project({
      sourceFiles: [{
        id: "file-1",
        name: "board.kicad_pcb",
        sizeBytes: 100,
        mimeType: "",
        extension: ".kicad_pcb",
        category: "kicad-pcb",
        categoryLabel: "KiCad PCB",
        classificationConfidence: "direct",
        metadataOnly: true
      }],
      completenessScore: 72,
      readinessLabel: "Partial engineering package",
      directEvidence: [{
        id: "evidence-file-1",
        kind: "direct-metadata",
        confidence: "direct",
        title: "PCB file loaded",
        message: "KiCad PCB file recognized.",
        sourceFileIds: ["file-1"]
      }],
      report: {
        status: "engineering-report",
        message: "Report available.",
        engineeringReport: {
          available: true,
          phase: "Phase 11",
          metadata: {
            id: "report-1",
            projectName: "Test Project",
            generatedAt: "2026-07-08T00:00:00.000Z",
            selectedMode: "analyze",
            sourceFileCount: 1,
            completenessScore: 72,
            readinessLabel: "Partial engineering package"
          },
          executiveSummary: [],
          sections: [],
          findings: [],
          riskMatrix: {
            highestSeverity: "high",
            bySeverity: { high: 1 },
            risks: [{
              id: "risk-1",
              section: "board",
              title: "Review board evidence",
              severity: "high",
              confidence: "direct",
              evidence: [],
              whyItMatters: "Evidence requires review.",
              recommendation: "Open the report.",
              limitation: "No validation claim.",
              sourcePhase: "test",
              sourceDataType: "test",
              category: "review",
              evidenceSummary: "Evidence exists.",
              status: "needs-review"
            }]
          },
          recommendations: [],
          confidenceSummary: [],
          missingDataSummary: [],
          evidenceRegister: [],
          limitations: [{ detail: "Datasheet review is still required.", requiredData: ["datasheet"] }],
          markdown: ""
        }
      }
    }));

    expect(model.report.available).toBe(true);
    expect(model.risks.high).toBe(1);
    expect(model.risks.top[0]?.evidenceIds).toContain("evidence-file-1");
    expect(model.limitations).toContain("Datasheet review is still required.");
  });
});
