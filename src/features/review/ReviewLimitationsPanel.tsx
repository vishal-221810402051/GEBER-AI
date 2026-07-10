import { GlassAlert } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewLimitationsPanelProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewLimitationsPanel({ model }: ReviewLimitationsPanelProps) {
  return (
    <section className="model-panel">
      <span className="eyebrow">Limitations</span>
      <h2>Confidence and review boundaries</h2>
      <GlassAlert
        variant="warning"
        title="Engineering review required"
        message="GEBER AI provides evidence-based engineering guidance. It does not replace datasheet review, DFM review, electrical validation, certification, or professional engineering judgement."
        compact
      />
      <div className="stage-list">
        {model.limitations.map((limitation) => (
          <article key={limitation} className="stage-row">
            <div>
              <strong>Limitation</strong>
              <small>{limitation}</small>
            </div>
            <span className="status-pill">review</span>
          </article>
        ))}
      </div>
    </section>
  );
}
