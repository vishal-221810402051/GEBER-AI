import type { NormalizedPCBProject, ParserStatus } from "../../domain";

type CountMap = Readonly<Record<string, number>>;

export type ReviewWorkspaceModel = Readonly<{
  hasProject: boolean;
  projectName: string;
  generatedAt: string;
  readinessLabel: string;
  files: {
    total: number;
    recognized: number;
    unsupported: number;
    categories: Array<{
      label: string;
      count: number;
    }>;
  };
  parsers: {
    total: number;
    complete: number;
    warning: number;
    error: number;
    notApplicable: number;
  };
  evidence: {
    total: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    preview: Array<{
      id: string;
      title: string;
      source: string;
      confidence: string;
    }>;
  };
  risks: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    top: Array<{
      id: string;
      title: string;
      severity: string;
      evidenceIds: string[];
      recommendation?: string;
    }>;
  };
  nextActions: Array<{
    title: string;
    reason: string;
    priority: string;
    href?: string;
  }>;
  firmware: {
    available: boolean;
    readiness: string;
    mcuCandidates: number;
    pinMappings: number;
    peripherals: number;
  };
  report: {
    available: boolean;
    confidenceScore?: number;
    sectionCount?: number;
    limitationCount?: number;
  };
  aiReview: {
    available: boolean;
    status: string;
  };
  limitations: string[];
}>;

const severityOrder = ["critical", "high", "medium", "low", "informational"];

function parserBucket(status: ParserStatus) {
  if (status === "parsed" || status === "metadata-classified") {
    return "complete";
  }

  if (status === "failed") {
    return "error";
  }

  if (status === "missing-required-file" || status === "skipped") {
    return "notApplicable";
  }

  return "warning";
}

function confidenceBucket(confidence: string) {
  if (confidence === "direct" || confidence === "inferred-high") {
    return "high";
  }

  if (confidence === "inferred-medium") {
    return "medium";
  }

  return "low";
}

function countBy<T extends string>(items: readonly T[]): CountMap {
  return items.reduce(
    (counts, item) => ({ ...counts, [item]: (counts[item] ?? 0) + 1 }),
    {} as Record<string, number>
  );
}

function evidenceIds(project: NormalizedPCBProject) {
  return [
    ...project.directEvidence.map((item) => item.id),
    ...project.inferredEvidence.map((item) => item.id)
  ].slice(0, 8);
}

function fileCategories(project: NormalizedPCBProject) {
  const counts = new Map<string, { label: string; count: number }>();

  project.sourceFiles.forEach((file) => {
    const current = counts.get(file.category) ?? {
      label: file.categoryLabel,
      count: 0
    };

    counts.set(file.category, { ...current, count: current.count + 1 });
  });

  return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function nextActions(project: NormalizedPCBProject, reportAvailable: boolean) {
  const categories = new Set(project.sourceFiles.map((file) => file.category));
  const actions: ReviewWorkspaceModel["nextActions"] = [];

  if (project.sourceFiles.length === 0) {
    actions.push({
      title: "Upload project files",
      reason: "The review workspace needs local project files before evidence can be summarized.",
      priority: "high",
      href: "/intake"
    });
    return actions;
  }

  if (!categories.has("kicad-pcb")) {
    actions.push({
      title: "Add KiCad PCB/layout file",
      reason: "Board, net, placement, and power evidence are stronger with layout data.",
      priority: "high",
      href: "/intake"
    });
  }

  if (!categories.has("kicad-schematic")) {
    actions.push({
      title: "Add schematic evidence",
      reason: "Schematic data improves intent, labels, firmware pin mapping, and review confidence.",
      priority: "high",
      href: "/intake"
    });
  }

  if (!categories.has("bom")) {
    actions.push({
      title: "Add BOM",
      reason: "BOM data improves component sourcing and cross-evidence review.",
      priority: "medium",
      href: "/intake"
    });
  }

  if (!categories.has("pick-and-place")) {
    actions.push({
      title: "Add pick-and-place file",
      reason: "Placement evidence improves component side and coordinate review.",
      priority: "medium",
      href: "/intake"
    });
  }

  if (reportAvailable) {
    actions.push({
      title: "Review engineering report",
      reason: "The deterministic report is available and remains the source of truth.",
      priority: "high",
      href: "/reports"
    });
  }

  if (project.firmware.manual?.available) {
    actions.push({
      title: "Review firmware guidance",
      reason: "Firmware guidance is available from parsed deterministic evidence.",
      priority: "medium",
      href: "/firmware"
    });
  }

  if (reportAvailable) {
    actions.push({
      title: "Run AI Review if useful",
      reason: "AI Review can explain the deterministic report after explicit consent.",
      priority: "low",
      href: "#ai-review"
    });
  }

  return actions.slice(0, 8);
}

export function buildReviewWorkspaceModel(project: NormalizedPCBProject): ReviewWorkspaceModel {
  const report = project.report.engineeringReport;
  const reportAvailable = Boolean(report?.available);
  const firmware = project.firmware.manual;
  const allEvidence = [...project.directEvidence, ...project.inferredEvidence];
  const evidenceConfidenceCounts = countBy(
    allEvidence.map((item) => confidenceBucket(item.confidence))
  );
  const parserBuckets = countBy(
    project.parserResult.stages.map((stage) => parserBucket(stage.status))
  );
  const risks = report?.riskMatrix.risks ?? [];
  const riskCounts = countBy(risks.map((risk) => risk.severity));
  const fallbackEvidenceIds = evidenceIds(project);
  const limitations = [
    ...(report?.limitations.map((limitation) => limitation.detail) ?? []),
    ...project.missingDataWarnings.map((warning) => warning.message),
    "GEBER AI provides evidence-based engineering guidance. It does not replace datasheet review, DFM review, electrical validation, certification, or professional engineering judgement."
  ];

  return {
    hasProject: project.sourceFiles.length > 0,
    projectName: project.name,
    generatedAt: report?.metadata.generatedAt ?? project.updatedAt,
    readinessLabel: project.readinessLabel,
    files: {
      total: project.sourceFiles.length,
      recognized: project.sourceFiles.filter((file) => file.category !== "unknown").length,
      unsupported: project.sourceFiles.filter((file) => file.category === "unknown").length,
      categories: fileCategories(project)
    },
    parsers: {
      total: project.parserResult.stages.length,
      complete: parserBuckets.complete ?? 0,
      warning: parserBuckets.warning ?? 0,
      error: parserBuckets.error ?? 0,
      notApplicable: parserBuckets.notApplicable ?? 0
    },
    evidence: {
      total: allEvidence.length,
      highConfidence: evidenceConfidenceCounts.high ?? 0,
      mediumConfidence: evidenceConfidenceCounts.medium ?? 0,
      lowConfidence: evidenceConfidenceCounts.low ?? 0,
      preview: allEvidence.slice(0, 8).map((item) => ({
        id: item.id,
        title: item.title,
        source: item.kind,
        confidence: item.confidence
      }))
    },
    risks: {
      total: risks.length,
      critical: riskCounts.critical ?? 0,
      high: riskCounts.high ?? 0,
      medium: riskCounts.medium ?? 0,
      low: riskCounts.low ?? 0,
      informational: riskCounts.informational ?? 0,
      top: [...risks]
        .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
        .slice(0, 6)
        .map((risk) => ({
          id: risk.id,
          title: risk.title,
          severity: risk.severity,
          evidenceIds: fallbackEvidenceIds,
          recommendation: risk.recommendation
        }))
    },
    nextActions: nextActions(project, reportAvailable),
    firmware: {
      available: Boolean(firmware?.available),
      readiness: firmware?.summary.readiness ?? "unavailable",
      mcuCandidates: firmware?.summary.mcuCandidates ?? 0,
      pinMappings: firmware?.summary.pinMapEntries ?? 0,
      peripherals: firmware?.summary.peripheralGroups ?? 0
    },
    report: {
      available: reportAvailable,
      confidenceScore: reportAvailable ? project.completenessScore : undefined,
      sectionCount: report?.sections.length,
      limitationCount: report?.limitations.length
    },
    aiReview: {
      available: reportAvailable,
      status: reportAvailable ? "consent-gated" : "report required"
    },
    limitations: Array.from(new Set(limitations)).slice(0, 10)
  };
}
