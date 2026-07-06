import { Link } from "react-router-dom";
import { PlannedCard } from "../components/cards/PlannedCard";

export function LandingPage() {
  return (
    <section className="landing-grid">
      <div className="hero-copy">
        <span className="eyebrow">EDA review console</span>
        <h1>GEBER AI</h1>
        <p className="tagline">
          Expert PCB investigation, BOM generation, and firmware documentation
          from design files.
        </p>
        <p>
          GEBER AI is planned to analyze KiCad, EasyEDA, Gerber, drill, BOM,
          pick-and-place, and netlist files while separating directly parsed
          facts from inferred findings.
        </p>
        <div className="hero-actions">
          <Link to="/intake" className="primary-action">
            Plan project intake
          </Link>
          <span className="inline-status">Upload not active</span>
        </div>
      </div>

      <aside className="mission-panel" aria-label="Phase 1 scope">
        <span className="status-pill">Phase 1</span>
        <h2>Application shell and intake planning</h2>
        <p>
          This build provides navigation, placeholder engineering workspaces,
          and the intake plan. It does not process design files yet.
        </p>
        <div className="signal-list">
          <span>Parser not implemented</span>
          <span>Analysis not implemented</span>
          <span>Reports not implemented</span>
        </div>
      </aside>

      <div className="card-grid full-span">
        <PlannedCard
          title="Gerber-only limitation"
          status="Important"
          description="Gerber files describe manufacturing artwork, but they may not include schematic intent, component semantics, BOM authority, or firmware pin purpose."
        />
        <PlannedCard
          title="Directly parsed facts"
          description="Future evidence will identify which facts came directly from supported files."
        />
        <PlannedCard
          title="Inferred findings"
          description="Future analysis will label inferred findings separately and attach confidence scoring."
        />
      </div>
    </section>
  );
}
