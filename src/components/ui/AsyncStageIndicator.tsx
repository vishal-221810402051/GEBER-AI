export type AsyncStageIndicatorStatus =
  | "idle"
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "error";

export type AsyncStageIndicatorProps = {
  label: string;
  status: AsyncStageIndicatorStatus;
  detail?: string;
};

export function AsyncStageIndicator({ label, status, detail }: AsyncStageIndicatorProps) {
  return (
    <div className={`async-stage-indicator async-stage-${status}`}>
      <span className="async-stage-dot" aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      <span className="async-stage-status">{status}</span>
    </div>
  );
}
