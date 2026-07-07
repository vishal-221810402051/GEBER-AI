import { Link } from "react-router-dom";
import type { AnalysisMode, CompletenessSummary } from "../../features/intake/intakeTypes";

type IntakeReadinessPanelProps = Readonly<{
  completeness: CompletenessSummary;
  mode: AnalysisMode;
  totalFiles: number;
  parsedFiles: number;
  warningCount: number;
  hasPcbData: boolean;
  hasFirmwareData: boolean;
  hasReport: boolean;
}>;

export function IntakeReadinessPanel({
  completeness,
  mode,
  totalFiles,
  parsedFiles,
  warningCount,
  hasPcbData,
  hasFirmwareData,
  hasReport
}: IntakeReadinessPanelProps) {
  return (
    <aside className="intake-readiness-panel" aria-label="Intake readiness">
      <span className="eyebrow">Readiness</span>
      <div className="metric-row">
        <strong>{completeness.score}/100</strong>
        <span>{completeness.readinessLabel}</span>
      </div>
      <div className="score-meter" aria-label="Project readiness score">
        <div style={{ width: `${completeness.score}%` }} />
      </div>
      <div className="intake-kpi-grid">
        <span>Total files <strong>{totalFiles}</strong></span>
        <span>Parsed <strong>{parsedFiles}</strong></span>
        <span>Warnings <strong>{warningCount}</strong></span>
        <span>Mode <strong>{mode}</strong></span>
      </div>
      <p className="muted">
        Engineering review is required before design, manufacturing, or firmware decisions.
      </p>
      {completeness.missingCategories.length ? (
        <details>
          <summary>Missing recommended files</summary>
          <div className="checklist">
            {completeness.missingCategories.map((category) => (
              <div key={category.key} className="check-row missing">
                <span>{category.label}</span>
                <small>{category.whyItMatters}</small>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      <div className="hero-actions">
        <Link to="/dashboard" className="secondary-action link-action">
          View Dashboard
        </Link>
        {hasReport ? (
          <Link to="/reports" className="secondary-action link-action">
            View Report
          </Link>
        ) : null}
        {hasPcbData ? (
          <Link to="/board" className="secondary-action link-action">
            View Board
          </Link>
        ) : null}
        {mode === "firmware" || hasFirmwareData ? (
          <Link to="/firmware" className="secondary-action link-action">
            View Firmware
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
