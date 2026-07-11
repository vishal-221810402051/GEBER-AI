import { Link } from "react-router-dom";
import { GlassStatusCard, RadialProgress } from "../ui";
import type { ProjectMode } from "../../domain/workflow";
import type { CompletenessSummary } from "../../features/intake/intakeTypes";

type IntakeReadinessPanelProps = Readonly<{
  completeness: CompletenessSummary;
  mode: ProjectMode;
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
  const readinessTone = completeness.score >= 80
    ? "success"
    : completeness.score >= 45
      ? "warning"
      : "active";

  return (
    <aside className="intake-readiness-panel" aria-label="Intake readiness">
      <span className="eyebrow">Readiness</span>
      <div className="metric-row readiness-metric-row">
        <RadialProgress
          value={completeness.score}
          label={`${completeness.score}/100`}
          caption={completeness.readinessLabel}
          tone={readinessTone}
          size={92}
        />
      </div>
      <div className="score-meter" aria-label="Project readiness score">
        <div style={{ width: `${completeness.score}%` }} />
      </div>
      <div className="intake-kpi-grid">
        <GlassStatusCard title="Total files" value={totalFiles} tone={totalFiles ? "success" : "neutral"} />
        <GlassStatusCard title="Parsed" value={parsedFiles} tone={parsedFiles ? "success" : "neutral"} />
        <GlassStatusCard title="Warnings" value={warningCount} tone={warningCount ? "warning" : "success"} />
        <GlassStatusCard title="Mode" value={mode} tone="active" />
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
