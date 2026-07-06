type PlannedCardProps = Readonly<{
  title: string;
  status?: string;
  description: string;
}>;

export function PlannedCard({
  title,
  status = "Planned",
  description
}: PlannedCardProps) {
  return (
    <article className="planned-card">
      <div className="card-heading">
        <h3>{title}</h3>
        <span className="status-pill">{status}</span>
      </div>
      <p>{description}</p>
    </article>
  );
}
