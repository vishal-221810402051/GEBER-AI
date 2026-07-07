import type { ReactNode } from "react";

export type GlassStatusCardTone =
  | "neutral"
  | "active"
  | "success"
  | "warning"
  | "error";

export type GlassStatusCardProps = {
  title: string;
  value?: string | number;
  description?: string;
  tone?: GlassStatusCardTone;
  badge?: string;
  children?: ReactNode;
  className?: string;
};

export function GlassStatusCard({
  title,
  value,
  description,
  tone = "neutral",
  badge,
  children,
  className = ""
}: GlassStatusCardProps) {
  const classes = ["glass-status-card", `glass-status-card-${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="glass-status-card-heading">
        <span>{title}</span>
        {badge ? <small>{badge}</small> : null}
      </div>
      {value !== undefined ? <strong>{value}</strong> : null}
      {description ? <p>{description}</p> : null}
      {children}
    </article>
  );
}
