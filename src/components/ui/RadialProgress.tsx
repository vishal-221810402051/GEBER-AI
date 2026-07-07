export type RadialProgressProps = {
  value: number;
  label?: string;
  caption?: string;
  size?: number;
  tone?: "active" | "success" | "warning" | "error" | "neutral";
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function RadialProgress({
  value,
  label,
  caption,
  size = 96,
  tone = "active"
}: RadialProgressProps) {
  const clampedValue = clampProgress(value);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`radial-progress radial-progress-${tone}`}
      style={{ width: size }}
      role="img"
      aria-label={`${label ?? "Progress"} ${Math.round(clampedValue)} percent`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="radial-progress-track" cx="50" cy="50" r={radius} />
        <circle
          className="radial-progress-value"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="radial-progress-label">
        <strong>{label ?? `${Math.round(clampedValue)}%`}</strong>
        {caption ? <span>{caption}</span> : null}
      </div>
    </div>
  );
}
