import { Link } from "react-router-dom";
import { GlassAlert, GlassStatusCard } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewRiskPanelProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

function alertVariant(severity: string) {
  if (severity === "critical") {
    return "error" as const;
  }

  if (severity === "high" || severity === "medium") {
    return "warning" as const;
  }

  return "info" as const;
}

export function ReviewRiskPanel({ model }: ReviewRiskPanelProps) {
  return (
    <section className="model-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Risks</span>
          <h2>Top deterministic risks</h2>
        </div>
        <Link to="/reports" className="secondary-action">Full report</Link>
      </div>
      <div className="review-card-grid">
        <GlassStatusCard title="Critical" value={model.risks.critical} tone={model.risks.critical ? "error" : "neutral"} />
        <GlassStatusCard title="High" value={model.risks.high} tone={model.risks.high ? "warning" : "neutral"} />
        <GlassStatusCard title="Medium" value={model.risks.medium} tone={model.risks.medium ? "warning" : "neutral"} />
        <GlassStatusCard title="Low/info" value={model.risks.low + model.risks.informational} tone="neutral" />
      </div>
      <div className="stage-list">
        {model.risks.top.length ? (
          model.risks.top.map((risk) => (
            <GlassAlert
              key={risk.id}
              variant={alertVariant(risk.severity)}
              title={risk.title}
              message={risk.recommendation ?? "Review deterministic report evidence before acting."}
              evidence={[
                `Risk ID: ${risk.id}`,
                `Severity: ${risk.severity}`,
                `Evidence IDs: ${risk.evidenceIds.length ? risk.evidenceIds.join(", ") : "evidence review required"}`
              ]}
              compact
            />
          ))
        ) : (
          <p className="muted">No deterministic risks are available yet. This is not a validation pass.</p>
        )}
      </div>
    </section>
  );
}
