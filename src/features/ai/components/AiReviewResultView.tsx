import { GlassAlert } from "../../../components/ui";
import type { AiReviewResult } from "../aiReviewTypes";

type AiReviewResultViewProps = Readonly<{
  result: AiReviewResult;
}>;

function evidenceText(evidenceIds: readonly string[]) {
  return evidenceIds.length ? evidenceIds.join(", ") : "Evidence review required";
}

export function AiReviewResultView({ result }: AiReviewResultViewProps) {
  return (
    <div className="ai-review-result">
      <GlassAlert
        variant="success"
        title="AI interpretation generated"
        message={result.summary}
        compact
      />
      <GlassAlert
        variant="warning"
        title="AI review limitation"
        message="AI Review is an evidence-bound interpretation of deterministic GEBER AI outputs. It is not validation, certification, DFM approval, or a replacement for engineering review."
        compact
      />
      <section className="summary-panel ai-interpretation-panel">
        <span className="eyebrow">AI interpretation</span>
        <h3>{result.engineeringReadiness.label}</h3>
        <p className="muted">{result.engineeringReadiness.explanation}</p>
      </section>
      <details className="intake-details-panel" open>
        <summary>Top risks</summary>
        <div className="stage-list">
          {result.topRisks.map((risk) => (
            <article key={risk.riskId} className="stage-row">
              <div>
                <strong>{risk.title}</strong>
                <small>{risk.explanation}</small>
                <small>Recommended action: {risk.recommendedAction}</small>
                <small>Evidence: {evidenceText(risk.evidenceIds)}</small>
              </div>
              <span className="status-pill">{risk.priority}</span>
            </article>
          ))}
        </div>
      </details>
      <details className="intake-details-panel" open>
        <summary>Next actions</summary>
        <div className="stage-list">
          {result.nextActions.map((action) => (
            <article key={`${action.title}-${action.priority}`} className="stage-row">
              <div>
                <strong>{action.title}</strong>
                <small>{action.reason}</small>
                <small>Evidence: {evidenceText(action.evidenceIds)}</small>
              </div>
              <span className="status-pill">{action.priority}</span>
            </article>
          ))}
        </div>
      </details>
      <div className="model-grid">
        <details className="intake-details-panel">
          <summary>Questions for engineer</summary>
          <div className="stage-list">
            {result.questionsForEngineer.map((question) => (
              <article key={question} className="stage-row">
                <small>{question}</small>
              </article>
            ))}
          </div>
        </details>
        <details className="intake-details-panel">
          <summary>Confidence notes</summary>
          <div className="stage-list">
            {result.confidenceNotes.map((note) => (
              <article key={note} className="stage-row">
                <small>{note}</small>
              </article>
            ))}
          </div>
        </details>
      </div>
      <details className="intake-details-panel">
        <summary>Report narrative</summary>
        <p className="muted">{result.reportNarrative}</p>
      </details>
      <details className="intake-details-panel">
        <summary>Limitations</summary>
        <div className="stage-list">
          {result.limitations.map((limitation) => (
            <article key={limitation} className="stage-row">
              <small>{limitation}</small>
            </article>
          ))}
        </div>
      </details>
    </div>
  );
}
