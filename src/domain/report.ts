import type { AnalysisConfidence, AnalysisSeverity } from "./analysis";

export type EngineeringReportEvidence = Readonly<{
  source: string;
  detail: string;
  confidence: AnalysisConfidence;
}>;

export type EngineeringReportLimitation = Readonly<{
  detail: string;
  requiredData: readonly string[];
}>;

export type EngineeringReportFinding = Readonly<{
  id: string;
  section: string;
  title: string;
  severity: AnalysisSeverity;
  confidence: AnalysisConfidence;
  affectedComponent?: string;
  affectedNet?: string;
  evidence: readonly EngineeringReportEvidence[];
  whyItMatters: string;
  recommendation: string;
  limitation: string;
  sourcePhase: string;
  sourceDataType: string;
}>;

export type EngineeringReportRisk = EngineeringReportFinding & Readonly<{
  category: string;
  evidenceSummary: string;
  status: "open" | "informational" | "cannot-determine" | "needs-review";
}>;

export type EngineeringReportRiskMatrix = Readonly<{
  risks: readonly EngineeringReportRisk[];
  highestSeverity: AnalysisSeverity;
  bySeverity: Readonly<Record<string, number>>;
}>;

export type EngineeringReportRecommendation = Readonly<{
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  evidenceBasis: string;
  requiredAction: string;
  expectedConfidenceImprovement: string;
}>;

export type EngineeringReportConfidenceSummary = Readonly<{
  category: string;
  level: "Strong" | "Moderate" | "Limited" | "Insufficient";
  evidence: string;
  missingData: string;
  improvement: string;
}>;

export type EngineeringReportMissingDataSummary = Readonly<{
  item: string;
  severity: AnalysisSeverity;
  requiredFiles: readonly string[];
  affectedSections: readonly string[];
  confidenceImpact: string;
}>;

export type EngineeringReportTable = Readonly<{
  title: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}>;

export type EngineeringReportSubsection = Readonly<{
  title: string;
  body: readonly string[];
  tables: readonly EngineeringReportTable[];
}>;

export type EngineeringReportSection = Readonly<{
  id: string;
  title: string;
  summary: string;
  subsections: readonly EngineeringReportSubsection[];
  findings: readonly EngineeringReportFinding[];
}>;

export type EngineeringReportMetadata = Readonly<{
  id: string;
  projectName: string;
  generatedAt: string;
  selectedMode: string;
  sourceFileCount: number;
  completenessScore: number;
  readinessLabel: string;
}>;

export type EngineeringReport = Readonly<{
  available: boolean;
  phase: "Phase 11";
  metadata: EngineeringReportMetadata;
  executiveSummary: readonly string[];
  sections: readonly EngineeringReportSection[];
  findings: readonly EngineeringReportFinding[];
  riskMatrix: EngineeringReportRiskMatrix;
  recommendations: readonly EngineeringReportRecommendation[];
  confidenceSummary: readonly EngineeringReportConfidenceSummary[];
  missingDataSummary: readonly EngineeringReportMissingDataSummary[];
  evidenceRegister: readonly EngineeringReportEvidence[];
  limitations: readonly EngineeringReportLimitation[];
  markdown: string;
}>;
