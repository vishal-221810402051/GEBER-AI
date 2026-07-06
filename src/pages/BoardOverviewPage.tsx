import { PageHeader } from "./shared/PageHeader";

export function BoardOverviewPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Board overview"
        title="Board geometry will appear after parser phases"
        description="This page is reserved for board dimensions, stackup, layers, pads, tracks, vias, zones, drill data, and outlines once real design-file parsing exists."
      />
      <div className="notice-panel">
        <span className="status-pill">Parser not implemented</span>
        <p>
          No board outline, copper, soldermask, drill, or zone facts are shown
          because no project files have been parsed.
        </p>
      </div>
    </section>
  );
}
