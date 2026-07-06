import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

export function PowerPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Power tree"
        title="Power rail and budget analysis is planned"
        description="Future power analysis will depend on parsed nets, component data, regulator topology, decoupling evidence, and BOM facts."
      />
      <div className="card-grid">
        <PlannedCard
          title="Rail detection"
          status="Future phase"
          description="Planned rail grouping for named power nets and regulator outputs."
        />
        <PlannedCard
          title="Power budget"
          status="Future phase"
          description="Planned current and load summaries when supporting source data is available."
        />
        <PlannedCard
          title="Confidence scoring"
          status="Future phase"
          description="Planned labels for direct facts, inferred relationships, and missing evidence."
        />
      </div>
    </section>
  );
}
