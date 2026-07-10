import { Link } from "react-router-dom";
import { GlassStatusCard } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewFilesPanelProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewFilesPanel({ model }: ReviewFilesPanelProps) {
  return (
    <section className="model-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Files</span>
          <h2>Project package summary</h2>
        </div>
        <Link to="/intake" className="secondary-action">Manage files</Link>
      </div>
      <div className="review-card-grid">
        <GlassStatusCard title="Total" value={model.files.total} tone={model.files.total ? "success" : "warning"} />
        <GlassStatusCard title="Recognized" value={model.files.recognized} tone={model.files.recognized ? "success" : "neutral"} />
        <GlassStatusCard title="Unsupported" value={model.files.unsupported} tone={model.files.unsupported ? "warning" : "success"} />
      </div>
      <div className="review-chip-grid">
        {model.files.categories.length ? (
          model.files.categories.map((category) => (
            <span key={category.label}>
              {category.label} <strong>{category.count}</strong>
            </span>
          ))
        ) : (
          <p className="muted">No files loaded yet. Start from Intake to add project evidence.</p>
        )}
      </div>
    </section>
  );
}
