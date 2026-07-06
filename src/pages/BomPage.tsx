import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

export function BomPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="BOM"
        title="BOM grouping and export are planned"
        description="Future BOM workflows will group references, values, footprints, manufacturer part numbers, supplier part numbers, quantities, and missing procurement data."
      />
      <div className="card-grid">
        <PlannedCard
          title="Reference grouping"
          status="Requires BOM files"
          description="Planned grouping by value, package, MPN, supplier code, and assembly side."
        />
        <PlannedCard
          title="Export formats"
          status="Future phase"
          description="CSV, XLSX, JSON, and report-linked BOM exports are planned after real BOM normalization exists."
        />
      </div>
    </section>
  );
}
