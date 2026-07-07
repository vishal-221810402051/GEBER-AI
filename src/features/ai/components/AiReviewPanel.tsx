import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GlassAlert,
  GlassStatusCard,
  LoadingDots,
  ProcessingOverlay
} from "../../../components/ui";
import type { NormalizedPCBProject } from "../../../domain";
import { getBackendCapabilities, requestAiReview } from "../../backend/apiClient";
import { buildAiReviewInput } from "../buildAiReviewInput";
import type { AiReviewResult } from "../aiReviewTypes";
import {
  getAiReviewErrorMessage,
  summarizeAiReviewInput,
  type AiBackendState
} from "../aiReviewPanelState";
import { AiReviewConsentNotice } from "./AiReviewConsentNotice";
import { AiReviewResultView } from "./AiReviewResultView";

type AiReviewPanelProps = Readonly<{
  normalizedProject: NormalizedPCBProject;
  reportAvailable: boolean;
}>;

export function AiReviewPanel({ normalizedProject, reportAvailable }: AiReviewPanelProps) {
  const [backendState, setBackendState] = useState<AiBackendState>({
    status: "checking",
    message: "Checking backend status."
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiReviewResult | null>(null);
  const aiInput = useMemo(() => buildAiReviewInput(normalizedProject), [normalizedProject]);
  const evidenceSummary = useMemo(() => summarizeAiReviewInput(aiInput), [aiInput]);
  const backendOnline = backendState.status === "online";
  const aiConfigured = backendOnline && backendState.capabilities.aiReviewConfigured;
  const canRun = reportAvailable && backendOnline && aiConfigured && consent && !loading;

  const checkBackend = useCallback(async () => {
    setBackendState({ status: "checking", message: "Checking backend status." });

    try {
      const response = await getBackendCapabilities();
      setBackendState({
        status: "online",
        capabilities: response.capabilities,
        message: response.message
      });
    } catch {
      setBackendState({
        status: "offline",
        message: "Backend unavailable. Start the GEBER AI backend to enable AI Review."
      });
    }
  }, []);

  useEffect(() => {
    void checkBackend();
  }, [checkBackend]);

  async function runAiReview() {
    if (!consent) {
      setError(getAiReviewErrorMessage("AI_REVIEW_CONSENT_REQUIRED", "Consent is required."));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await requestAiReview(aiInput, true);

    if (response.ok) {
      setResult(response.result);
    } else {
      setError(getAiReviewErrorMessage(response.error.code, response.error.message));
    }

    setLoading(false);
  }

  return (
    <section className="model-panel ai-review-panel">
      <ProcessingOverlay
        active={loading}
        title="Generating evidence-bound engineering interpretation"
        message="The backend is reviewing structured deterministic evidence only. Raw design files are not sent."
      />
      <div className="section-heading">
        <div>
          <span className="eyebrow">AI Engineering Review</span>
          <h2>Evidence-bound interpretation</h2>
        </div>
        {loading ? <LoadingDots label="AI review running" /> : null}
      </div>
      <p className="muted">
        Generate an evidence-bound interpretation from the deterministic report.
        Deterministic findings remain the source of truth.
      </p>

      <div className="ai-status-grid">
        <GlassStatusCard
          title="Backend"
          value={backendState.status}
          tone={backendOnline ? "success" : backendState.status === "checking" ? "active" : "warning"}
          description={backendState.message}
        />
        <GlassStatusCard
          title="AI configuration"
          value={aiConfigured ? "ready" : "not configured"}
          tone={aiConfigured ? "success" : "warning"}
          description="OPENAI_API_KEY is read by the backend only."
        />
        <GlassStatusCard
          title="Report evidence"
          value={reportAvailable ? "available" : "missing"}
          tone={reportAvailable ? "success" : "warning"}
          description={reportAvailable ? "Deterministic report can be reviewed." : "AI Review requires a deterministic report first."}
        />
      </div>

      {!reportAvailable ? (
        <GlassAlert
          variant="warning"
          title="Deterministic report required"
          message="AI Review requires a deterministic GEBER AI report first. Upload and process project files before running AI Review."
          compact
        />
      ) : null}
      {backendState.status === "offline" ? (
        <GlassAlert variant="warning" title="Backend unavailable" message={backendState.message} compact />
      ) : null}
      {backendOnline && !aiConfigured ? (
        <GlassAlert
          variant="warning"
          title="AI Review is not configured"
          message="Add OPENAI_API_KEY to the backend environment to enable server-side AI Review."
          compact
        />
      ) : null}

      <details className="intake-details-panel">
        <summary>View evidence package summary</summary>
        <div className="ai-evidence-grid">
          {evidenceSummary.map((item) => (
            <span key={item.label}>
              {item.label} <strong>{item.value}</strong>
            </span>
          ))}
        </div>
      </details>

      <AiReviewConsentNotice
        consent={consent}
        disabled={!reportAvailable || !backendOnline || !aiConfigured || loading}
        onConsentChange={setConsent}
      />

      <div className="hero-actions">
        <button
          type="button"
          className="secondary-action"
          onClick={checkBackend}
          disabled={loading}
        >
          Check backend status
        </button>
        <button
          type="button"
          className="secondary-action"
          disabled={!canRun}
          onClick={runAiReview}
        >
          Run AI Review
        </button>
      </div>

      {error ? (
        <GlassAlert variant="warning" title="AI Review unavailable" message={error} compact />
      ) : null}
      {result ? <AiReviewResultView result={result} /> : null}
    </section>
  );
}
