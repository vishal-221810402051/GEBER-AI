import type { ReactNode } from "react";

export type GlassAlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

export type GlassAlertProps = {
  variant: GlassAlertVariant;
  title: string;
  message?: string;
  action?: ReactNode;
  evidence?: string[];
  compact?: boolean;
  className?: string;
};

export function GlassAlert({
  variant,
  title,
  message,
  action,
  evidence,
  compact = false,
  className = ""
}: GlassAlertProps) {
  const classes = [
    "glass-alert",
    `glass-alert-${variant}`,
    compact ? "glass-alert-compact" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} aria-label={title}>
      <div className="glass-alert-main">
        <strong>{title}</strong>
        {message ? <p>{message}</p> : null}
        {evidence?.length ? (
          <ul className="glass-alert-evidence">
            {evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {action ? <div className="glass-alert-action">{action}</div> : null}
    </section>
  );
}
