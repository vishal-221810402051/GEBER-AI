import { PageHeader } from "./shared/PageHeader";

const fields = [
  "Reference",
  "Value",
  "Footprint",
  "Layer",
  "Position",
  "Rotation",
  "Pins",
  "Connected nets",
  "MPN",
  "Assembly status"
];

export function ComponentsPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Component explorer"
        title="Component tables will be populated from parsed project files"
        description="The future explorer will separate directly parsed facts from inferred findings and confidence-scored enrichments."
      />
      <div className="table-shell">
        {fields.map((field) => (
          <span key={field}>{field}</span>
        ))}
      </div>
      <p className="muted">
        Planned only. No fake components, counts, placements, or part data are
        displayed in Phase 1.
      </p>
    </section>
  );
}
