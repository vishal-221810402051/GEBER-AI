import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { AiReviewPanel } from "../features/ai/components/AiReviewPanel";
import { useFileIntake } from "../features/intake/useFileIntake";
import { copyTextToClipboard } from "../features/export/clipboard";
import { tableToCsv } from "../features/export/csv";
import { downloadTextFile } from "../features/export/downloadFile";
import { toPrettyJson } from "../features/export/json";
import { buildMissingDataExport, buildRecommendationExport, buildRiskExport } from "../features/export/buildRiskExport";
import { PageHeader } from "./shared/PageHeader";

export function ReportsPage() {
  const { normalizedProject } = useFileIntake();
  const report = normalizedProject.report.engineeringReport;
  const [exportStatus, setExportStatus] = useState("Exports are generated from current parsed data. Unknown values are preserved.");

  if (!report || !report.available) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Engineering report"
          title="No project package available"
          description="A full engineering report requires parsed project files."
        />
        <div className="empty-state">
          <span className="status-pill">Report unavailable</span>
          <p>Start from Intake to select project files.</p>
          <Link to="/intake" className="primary-action">Start from Intake</Link>
        </div>
        <AiReviewPanel normalizedProject={normalizedProject} reportAvailable={false} />
      </section>
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Engineering report"
        title={report.metadata.projectName}
        description="Report generated from parsed project files and deterministic analysis results. It does not claim full validation."
      />

      <div className="notice-panel warning">
        <span className="status-pill">Evidence-based</span>
        <p>
          Electrical correctness, schematic-to-PCB match, manufacturing package
          validation, firmware readiness, power integrity, and production
          readiness are not guaranteed.
        </p>
      </div>

      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Report readiness</span>
          <div className="tag-list">
            <span>Files: {report.metadata.sourceFileCount}</span>
            <span>Score: {report.metadata.completenessScore}/100</span>
            <span>{report.metadata.readinessLabel}</span>
            <span>Findings: {report.findings.length}</span>
            <span>Highest: {report.riskMatrix.highestSeverity}</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Report exports</span>
          <div className="hero-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => copyTextToClipboard(report.markdown).then((result) => setExportStatus(result.message))}
            >
              Copy Markdown
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setExportStatus(downloadTextFile(`${report.metadata.projectName}-engineering-report.md`, report.markdown, "text/markdown").message)}
            >
              Download MD
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setExportStatus(downloadTextFile(`${report.metadata.projectName}-engineering-report.json`, toPrettyJson(report), "application/json").message)}
            >
              Download JSON
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                window.print();
                setExportStatus("Browser print/export to PDF opened. Server-side PDF generation is not implemented.");
              }}
            >
              Print / Save PDF
            </button>
          </div>
          <p className="muted">{exportStatus}</p>
          <div className="tag-list">
            <button type="button" className="text-action" onClick={() => setExportStatus(downloadTextFile("geberai-risk-matrix.csv", tableToCsv(buildRiskExport(report)), "text/csv").message)}>Risk CSV</button>
            <button type="button" className="text-action" onClick={() => setExportStatus(downloadTextFile("geberai-recommendations.csv", tableToCsv(buildRecommendationExport(report)), "text/csv").message)}>Recommendations CSV</button>
            <button type="button" className="text-action" onClick={() => setExportStatus(downloadTextFile("geberai-missing-data.csv", tableToCsv(buildMissingDataExport(report)), "text/csv").message)}>Missing Data CSV</button>
          </div>
          <p className="muted">Full production export workflows remain future hardening work.</p>
        </section>
      </div>

      <AiReviewPanel normalizedProject={normalizedProject} reportAvailable />

      <section className="model-panel">
        <h2>Executive Summary</h2>
        <div className="stage-list">
          {report.executiveSummary.map((item, index) => (
            <article key={index} className="stage-row">
              <small>{item}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="model-grid">
        <section className="model-panel">
          <h2>Confidence Summary</h2>
          <div className="stage-list">
            {report.confidenceSummary.map((row) => (
              <article key={row.category} className="stage-row">
                <div>
                  <strong>{row.category}</strong>
                  <small>{row.evidence}</small>
                  <small>Improve: {row.improvement}</small>
                </div>
                <span className="status-pill">{row.level}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="model-panel">
          <h2>Engineering Recommendations</h2>
          <div className="stage-list">
            {report.recommendations.map((recommendation) => (
              <article key={recommendation.id} className="stage-row">
                <div>
                  <strong>{recommendation.title}</strong>
                  <small>{recommendation.evidenceBasis}</small>
                  <small>{recommendation.requiredAction}</small>
                </div>
                <span className="status-pill">{recommendation.priority}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="model-panel">
        <h2>Risk Matrix</h2>
        <div className="data-table report-risk-table">
          <span>ID</span>
          <span>Severity</span>
          <span>Confidence</span>
          <span>Category</span>
          <span>Title</span>
          <span>Affected</span>
          <span>Status</span>
          <span>Recommendation</span>
          {report.riskMatrix.risks.slice(0, 120).map((risk) => (
            <Fragment key={risk.id}>
              <span>{risk.id}</span>
              <span>{risk.severity}</span>
              <span>{risk.confidence}</span>
              <span>{risk.category}</span>
              <span>{risk.title}</span>
              <span>{risk.affectedComponent ?? risk.affectedNet ?? "Project"}</span>
              <span>{risk.status}</span>
              <span>{risk.recommendation}</span>
            </Fragment>
          ))}
        </div>
      </section>

      <section className="model-panel">
        <h2>Section Navigation</h2>
        <div className="tag-list">
          {report.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>{section.title}</a>
          ))}
        </div>
      </section>

      {report.sections.map((section) => (
        <section key={section.id} id={section.id} className="model-panel">
          <h2>{section.title}</h2>
          <p className="muted">{section.summary}</p>
          {section.subsections.map((subsection) => (
            <div key={subsection.title} className="page-stack">
              <h3>{subsection.title}</h3>
              {subsection.body.map((item, index) => <p key={index} className="muted">{item}</p>)}
              {subsection.tables.map((tbl) => (
                <div key={tbl.title} className="stage-list">
                  <strong>{tbl.title}</strong>
                  <small>{tbl.rows.length} row(s), columns: {tbl.columns.join(", ")}</small>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}

      <div className="model-grid">
        <section className="model-panel">
          <h2>Evidence Register</h2>
          <div className="stage-list">
            {report.evidenceRegister.slice(0, 60).map((item, index) => (
              <article key={`${item.source}-${index}`} className="stage-row">
                <div>
                  <strong>{item.source}</strong>
                  <small>{item.detail}</small>
                </div>
                <span className="status-pill">{item.confidence}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="model-panel">
          <h2>Limitations and Required Next Files</h2>
          <div className="stage-list">
            {report.limitations.map((item, index) => (
              <article key={index} className="stage-row">
                <div>
                  <strong>{item.detail}</strong>
                  <small>Required: {item.requiredData.join(", ") || "manual review"}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
