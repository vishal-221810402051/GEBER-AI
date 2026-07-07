import type { EngineeringReport } from "../../domain/report";

function tableMarkdown(columns: readonly string[], rows: readonly (readonly string[])[]): string {
  if (!rows.length) return "";
  return [
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\|/g, "/")).join(" | ")} |`)
  ].join("\n");
}

export function buildReportMarkdown(report: Omit<EngineeringReport, "markdown">): string {
  const lines = [
    `# ${report.metadata.projectName} Engineering Report`,
    "",
    `Generated: ${report.metadata.generatedAt}`,
    `Mode: ${report.metadata.selectedMode}`,
    "",
    "## Executive Summary",
    ...report.executiveSummary.map((item) => `- ${item}`),
    "",
    "## Risk Matrix",
    ...report.riskMatrix.risks.slice(0, 40).map((risk) => `- **${risk.severity}** ${risk.title} (${risk.sourcePhase}) - ${risk.recommendation}`),
    "",
    "## Recommendations",
    ...report.recommendations.map((rec) => `- **${rec.priority}** ${rec.title}: ${rec.requiredAction}`),
    ""
  ];

  report.sections.forEach((section) => {
    lines.push(`## ${section.title}`, section.summary, "");
    section.subsections.forEach((subsection) => {
      lines.push(`### ${subsection.title}`, ...subsection.body, "");
      subsection.tables.forEach((tbl) => {
        lines.push(`#### ${tbl.title}`, tableMarkdown(tbl.columns, tbl.rows), "");
      });
    });
  });

  lines.push("## Limitations", ...report.limitations.map((item) => `- ${item.detail}`));
  return lines.join("\n");
}
