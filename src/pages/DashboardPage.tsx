import { Link } from "react-router-dom";
import { PlannedCard } from "../components/cards/PlannedCard";
import { formatFileSize } from "../features/intake/formatFileSize";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

const plannedCards = [
  "Parser confidence",
  "Components",
  "Nets",
  "Critical issues",
  "BOM status",
  "Firmware report status"
];

export function DashboardPage() {
  const { completeness, files, totalSizeBytes } = useFileIntake();

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Project dashboard"
        description="Phase 2 dashboard state reflects local intake metadata only. It does not show parsed PCB contents, extracted nets, generated BOMs, or electrical analysis."
      />

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="status-pill">No project package uploaded yet</span>
          <p>
            Start from Intake to select files for local metadata classification.
          </p>
          <Link to="/intake" className="primary-action">
            Start from Intake
          </Link>
        </div>
      ) : (
        <div className="summary-grid">
          <section className="summary-panel">
            <span className="eyebrow">File completeness</span>
            <div className="score-meter" aria-label="File completeness score">
              <div style={{ width: `${completeness.score}%` }} />
            </div>
            <div className="metric-row">
              <strong>{completeness.score}/100</strong>
              <span>{completeness.readinessLabel}</span>
            </div>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Uploaded files</span>
            <div className="metric-row">
              <strong>{files.length}</strong>
              <span>{formatFileSize(totalSizeBytes)}</span>
            </div>
            <p className="muted">Classification is extension/name based only.</p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Detected categories</span>
            <div className="tag-list">
              {completeness.detectedCategories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="card-grid dashboard-grid">
        {plannedCards.map((title) => (
          <PlannedCard
            key={title}
            title={title}
            status="Parser not implemented"
            description="Requires future content parsing and normalized project data. No fake project data is displayed."
          />
        ))}
      </div>
    </section>
  );
}
