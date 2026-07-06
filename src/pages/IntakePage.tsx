import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

const workflowSteps = [
  "Project package upload",
  "File type detection",
  "File completeness score",
  "Analysis mode selection",
  "Parser status"
];

const fileTypes = [
  ".kicad_sch",
  ".kicad_pcb",
  ".kicad_pro",
  "Gerber RS-274X / Gerber X2",
  "Excellon drill files",
  "IPC-356 netlist",
  "BOM CSV/XLSX",
  "Pick-and-place / centroid files",
  "EasyEDA exports where technically supportable"
];

export function IntakePage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Intake planning"
        title="Plan the future project intake workflow"
        description="Phase 1 defines the surface area only. No upload control, file classification, archive inspection, or parser execution is active."
      />

      <div className="notice-panel strong">
        <span className="status-pill">Phase 2</span>
        <p>Functional upload and file classification begin in Phase 2.</p>
      </div>

      <div className="timeline">
        {workflowSteps.map((step, index) => (
          <article key={step} className="timeline-step">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step}</h3>
            <p>Planned. Upload not active and parser not implemented.</p>
          </article>
        ))}
      </div>

      <div className="two-column">
        <section>
          <h2>Supported Future File Types</h2>
          <div className="tag-list">
            {fileTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </section>
        <section>
          <h2>Intake Status Labels</h2>
          <div className="card-grid single">
            <PlannedCard
              title="Missing data"
              status="Planned"
              description="Future intake will identify unavailable source files and warn when conclusions are limited."
            />
            <PlannedCard
              title="Directly parsed facts"
              status="Planned"
              description="Future parser outputs will distinguish file-derived facts from inferred findings."
            />
            <PlannedCard
              title="Confidence scoring"
              status="Planned"
              description="Future analysis will attach confidence levels to supported findings."
            />
          </div>
        </section>
      </div>
    </section>
  );
}
