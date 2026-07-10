import { Link } from "react-router-dom";
import { GlassStatusCard } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewEvidencePanelProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewEvidencePanel({ model }: ReviewEvidencePanelProps) {
  return (
    <section className="model-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Evidence</span>
          <h2>Curated evidence preview</h2>
        </div>
        <div className="hero-actions">
          <Link to="/board" className="secondary-action">Board</Link>
          <Link to="/components" className="secondary-action">Components</Link>
          <Link to="/nets" className="secondary-action">Nets</Link>
          <Link to="/power" className="secondary-action">Power</Link>
          <Link to="/bom" className="secondary-action">BOM</Link>
        </div>
      </div>
      <div className="review-card-grid">
        <GlassStatusCard title="Evidence items" value={model.evidence.total} tone={model.evidence.total ? "success" : "neutral"} />
        <GlassStatusCard title="High confidence" value={model.evidence.highConfidence} tone="success" />
        <GlassStatusCard title="Medium confidence" value={model.evidence.mediumConfidence} tone="active" />
        <GlassStatusCard title="Low confidence" value={model.evidence.lowConfidence} tone={model.evidence.lowConfidence ? "warning" : "neutral"} />
      </div>
      <div className="stage-list">
        {model.evidence.preview.length ? (
          model.evidence.preview.map((item) => (
            <article key={item.id} className="stage-row">
              <div>
                <strong>{item.title}</strong>
                <small>Evidence ID: {item.id}</small>
              </div>
              <span className="status-pill">{item.source}</span>
              <span className="status-pill">{item.confidence}</span>
            </article>
          ))
        ) : (
          <p className="muted">Evidence preview is unavailable until project files are loaded and classified.</p>
        )}
      </div>
    </section>
  );
}
