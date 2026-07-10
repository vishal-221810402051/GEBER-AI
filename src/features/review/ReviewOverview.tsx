import { Link } from "react-router-dom";
import { GlassStatusCard, RadialProgress } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewOverviewProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewOverview({ model }: ReviewOverviewProps) {
  return (
    <div className="review-section-grid">
      <section className="model-panel review-score-panel">
        <RadialProgress
          value={model.report.confidenceScore ?? 0}
          label="Readiness"
          caption={model.report.available ? "Report input" : "No report"}
        />
        <p className="muted">
          Readiness is derived from uploaded files and deterministic evidence. It is not a validation score.
        </p>
      </section>
      <div className="review-card-grid">
        <GlassStatusCard title="Files loaded" value={model.files.total} tone={model.files.total ? "success" : "warning"} />
        <GlassStatusCard title="Parser stages" value={`${model.parsers.complete}/${model.parsers.total}`} description="Complete or classified stages" tone={model.parsers.error ? "error" : "active"} />
        <GlassStatusCard title="Evidence available" value={model.evidence.total} tone={model.evidence.total ? "success" : "neutral"} />
        <GlassStatusCard title="Risks and actions" value={`${model.risks.total}/${model.nextActions.length}`} description="Risks / next actions" tone={model.risks.critical || model.risks.high ? "warning" : "neutral"} />
        <GlassStatusCard title="Firmware" value={model.firmware.readiness} tone={model.firmware.available ? "success" : "warning"} />
        <GlassStatusCard title="AI Review" value={model.aiReview.status} tone={model.aiReview.available ? "active" : "warning"} />
      </div>
      <section className="model-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Recommended next actions</span>
            <h2>What to do next</h2>
          </div>
          <Link to="/reports" className="secondary-action">Full report</Link>
        </div>
        <div className="stage-list">
          {model.nextActions.map((action) => (
            <article key={`${action.title}-${action.priority}`} className="stage-row">
              <div>
                <strong>{action.title}</strong>
                <small>{action.reason}</small>
              </div>
              <span className="status-pill">{action.priority}</span>
              {action.href ? <Link to={action.href} className="secondary-action">Open</Link> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
