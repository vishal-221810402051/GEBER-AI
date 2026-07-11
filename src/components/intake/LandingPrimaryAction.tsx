import { useNavigate } from "react-router-dom";
import type { WorkflowReadiness, ProjectWorkflowResult } from "../../features/workflow";
import { GlassAlert } from "../ui";

type LandingPrimaryActionProps = Readonly<{
  readiness: WorkflowReadiness;
  workflowResult: ProjectWorkflowResult | null;
  onRunWorkflow: () => ProjectWorkflowResult;
}>;

export function LandingPrimaryAction({
  readiness,
  workflowResult,
  onRunWorkflow
}: LandingPrimaryActionProps) {
  const navigate = useNavigate();
  const blockedResult = workflowResult?.status === "blocked" ? workflowResult : undefined;

  function handleStart() {
    const result = onRunWorkflow();

    if (result.status !== "ready") {
      return;
    }

    navigate(result.outputKind === "engineering-report" ? "/reports" : "/firmware");
  }

  return (
    <section className="landing-action-card" aria-label="Start workflow">
      <div>
        <span className="eyebrow">Next</span>
        <h2>{readiness.actionLabel}</h2>
        <p>
          Select the current deterministic output for the chosen mode.
          Dedicated processing and result routes remain future work.
        </p>
      </div>
      <button
        type="button"
        className="primary-action landing-start-action"
        onClick={handleStart}
      >
        {readiness.actionLabel}
      </button>
      {blockedResult ? (
        <GlassAlert
          variant="warning"
          title="Workflow input required"
          message={blockedResult.reasons.join(" ")}
          evidence={[...blockedResult.missingInputs]}
          compact
        />
      ) : readiness.missingInputs.length ? (
        <p className="muted">
          Missing input: {readiness.missingInputs.join(", ")}.
        </p>
      ) : (
        <p className="muted">
          Ready to select the current evidence-based {readiness.mode} output.
        </p>
      )}
    </section>
  );
}
