import { Link } from "react-router-dom";
import { GlassStatusCard } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewHeaderProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewHeader({ model }: ReviewHeaderProps) {
  return (
    <header className="review-hero">
      <div className="review-hero-copy">
        <span className="eyebrow">Smart Review Workspace</span>
        <h1>{model.projectName}</h1>
        <p>
          A compact command center for deterministic project evidence, top risks,
          next actions, firmware readiness, report access, and consent-gated AI Review.
        </p>
        <div className="hero-actions">
          <Link to="/intake" className="secondary-action">Go to Intake</Link>
          <Link to="/reports" className="primary-action">View Report</Link>
          {model.firmware.available ? (
            <Link to="/firmware" className="secondary-action">View Firmware</Link>
          ) : null}
        </div>
      </div>
      <div className="review-hero-grid">
        <GlassStatusCard
          title="Readiness"
          value={model.readinessLabel}
          tone={model.hasProject ? "active" : "warning"}
        />
        <GlassStatusCard title="Files" value={model.files.total} tone={model.files.total ? "success" : "warning"} />
        <GlassStatusCard title="Evidence" value={model.evidence.total} tone={model.evidence.total ? "success" : "neutral"} />
        <GlassStatusCard title="Risks" value={model.risks.total} tone={model.risks.high || model.risks.critical ? "warning" : "neutral"} />
        <GlassStatusCard title="Report" value={model.report.available ? "available" : "unavailable"} tone={model.report.available ? "success" : "warning"} />
        <GlassStatusCard title="AI Review" value={model.aiReview.status} tone={model.aiReview.available ? "active" : "warning"} />
      </div>
    </header>
  );
}
