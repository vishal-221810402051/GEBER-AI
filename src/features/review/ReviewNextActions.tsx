import { Link } from "react-router-dom";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewNextActionsProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewNextActions({ model }: ReviewNextActionsProps) {
  return (
    <section className="model-panel">
      <span className="eyebrow">Next actions</span>
      <h2>Deterministic review queue</h2>
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
  );
}
