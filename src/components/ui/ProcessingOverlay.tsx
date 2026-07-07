import { LoadingDots } from "./LoadingDots";
import { PipelineStepper, type PipelineStage } from "./PipelineStepper";
import { RadialProgress } from "./RadialProgress";

export type ProcessingOverlayProps = {
  active: boolean;
  title: string;
  message?: string;
  progress?: number;
  stages?: PipelineStage[];
  onCancel?: () => void;
};

export function ProcessingOverlay({
  active,
  title,
  message,
  progress,
  stages,
  onCancel
}: ProcessingOverlayProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="processing-overlay" role="status" aria-live="polite">
      <section className="processing-overlay-panel" aria-label={title}>
        {progress !== undefined ? (
          <RadialProgress value={progress} tone="active" caption="Local processing" />
        ) : (
          <LoadingDots label={title} />
        )}
        <div className="processing-overlay-copy">
          <h2>{title}</h2>
          {message ? <p>{message}</p> : null}
        </div>
        {stages?.length ? <PipelineStepper stages={stages} compact /> : null}
        {onCancel ? (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </section>
    </div>
  );
}
