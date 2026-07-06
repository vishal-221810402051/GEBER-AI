import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

export function ReportsPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Reports"
        title="Full engineering reports are planned"
        description="Future reports will compile validated project facts, warnings, issue summaries, confidence scoring, and export-ready documentation."
      />
      <div className="card-grid">
        <PlannedCard
          title="Executive summary"
          status="Future phase"
          description="Planned concise board-level summary based only on real parsed and analyzed evidence."
        />
        <PlannedCard
          title="Risk matrix"
          status="Future phase"
          description="Planned issue grouping by severity, confidence, subsystem, and missing-data warnings."
        />
        <PlannedCard
          title="Export support"
          status="Future phase"
          description="Planned PDF, HTML, Markdown, and JSON exports after report generation is implemented."
        />
      </div>
    </section>
  );
}
