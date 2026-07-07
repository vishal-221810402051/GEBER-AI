import type { NormalizedPCBProject, ParserStatus } from "../../domain";
import type { AiReviewConfidence, AiReviewInput, AiReviewParserStatus, AiReviewSeverity } from "./aiReviewTypes";

function severity(value: string): AiReviewSeverity {
  if (value === "info") {
    return "informational";
  }

  if (["critical", "high", "medium", "low", "informational"].includes(value)) {
    return value as AiReviewSeverity;
  }

  return "informational";
}

function priority(value: string): AiReviewSeverity {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return severity(value);
}

function confidence(value: string): AiReviewConfidence {
  if (value === "direct" || value === "inferred-high" || value === "Strong") {
    return "high";
  }

  if (value === "inferred-medium" || value === "Moderate") {
    return "medium";
  }

  if (value === "inferred-low" || value === "missing-data" || value === "Limited" || value === "Insufficient") {
    return "low";
  }

  return "unknown";
}

function parserStatus(status: ParserStatus, diagnosticsCount: number): AiReviewParserStatus {
  if (status === "parsed" || status === "metadata-classified") {
    return diagnosticsCount ? "warning" : "complete";
  }

  if (status === "failed") {
    return "error";
  }

  if (status === "missing-required-file" || status === "skipped") {
    return "not_applicable";
  }

  if (status === "not-started" || status === "waiting-for-files") {
    return "not_run";
  }

  return "warning";
}

function countByCategory(project: NormalizedPCBProject) {
  const counts = new Map<string, number>();

  project.sourceFiles.forEach((file) => {
    counts.set(file.category, (counts.get(file.category) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, count]) => ({ category, count }));
}

function diagnosticsForParser(project: NormalizedPCBProject, parserId: string) {
  const parserDiagnostics: readonly { parserStage: string }[] = [
    ...(project.board.kicadPcb?.diagnostics ?? []),
    ...(project.schematic.kicadSchematic?.diagnostics ?? []),
    ...(project.bom.bom?.diagnostics ?? []),
    ...(project.placement.placement?.diagnostics ?? [])
  ];

  return parserDiagnostics.filter((diagnostic) => diagnostic.parserStage === parserId).length;
}

function evidenceIds(project: NormalizedPCBProject) {
  return [
    ...project.directEvidence.map((item) => item.id),
    ...project.inferredEvidence.map((item) => item.id)
  ].slice(0, 12);
}

export function buildAiReviewInput(project: NormalizedPCBProject): AiReviewInput {
  const report = project.report.engineeringReport;
  const manual = project.firmware.manual;
  const fallbackEvidenceIds = evidenceIds(project);

  return {
    project: {
      name: project.name,
      source: "geber-ai-deterministic-local-state",
      generatedAt: new Date().toISOString()
    },
    fileSummary: {
      totalFiles: project.sourceFiles.length,
      recognizedFiles: project.sourceFiles.filter((file) => file.category !== "unknown").length,
      unsupportedFiles: project.sourceFiles.filter((file) => file.category === "unknown").length,
      categories: countByCategory(project),
      missingRecommendedFiles: project.missingDataWarnings.flatMap((warning) => warning.requiredFiles).slice(0, 20)
    },
    parserStatus: project.parserResult.stages.map((stage) => {
      const diagnosticsCount = diagnosticsForParser(project, stage.id);

      return {
        parser: stage.label,
        status: parserStatus(stage.status, diagnosticsCount),
        filesInvolved: stage.fileIds.length,
        diagnosticsCount,
        summary: stage.message
      };
    }),
    evidenceSummary: [
      ...project.directEvidence.map((item) => ({
        evidenceId: item.id,
        title: item.title,
        source: item.kind,
        confidence: confidence(item.confidence),
        detail: item.message
      })),
      ...project.inferredEvidence.map((item) => ({
        evidenceId: item.id,
        title: item.title,
        source: item.kind,
        confidence: confidence(item.confidence),
        detail: item.message
      }))
    ].slice(0, 60),
    risks: (report?.riskMatrix.risks ?? []).slice(0, 25).map((risk) => ({
      riskId: risk.id,
      severity: severity(risk.severity),
      title: risk.title,
      description: risk.whyItMatters,
      evidenceIds: fallbackEvidenceIds,
      recommendation: risk.recommendation
    })),
    recommendations: (report?.recommendations ?? []).slice(0, 20).map((recommendation) => ({
      recommendationId: recommendation.id,
      priority: priority(recommendation.priority),
      title: recommendation.title,
      action: recommendation.requiredAction,
      evidenceIds: fallbackEvidenceIds
    })),
    missingDataWarnings: project.missingDataWarnings.slice(0, 30).map((warning) => ({
      id: warning.id,
      severity: severity(warning.severity),
      message: warning.message
    })),
    firmwareSummary: manual
      ? {
          available: manual.available,
          mcuCandidates: manual.summary.mcuCandidates,
          pinMappings: manual.summary.pinMapEntries,
          peripherals: manual.peripherals.slice(0, 16).map((peripheral) => peripheral.busName),
          limitations: manual.limitations.slice(0, 12)
        }
      : undefined,
    reportSummary: report
      ? {
          available: report.available,
          confidenceScore: project.completenessScore,
          sectionCount: report.sections.length,
          limitationCount: report.limitations.length
        }
      : {
          available: false,
          confidenceScore: project.completenessScore,
          sectionCount: 0,
          limitationCount: project.missingDataWarnings.length
        }
  };
}
