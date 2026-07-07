import { Link } from "react-router-dom";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function PowerPage() {
  const { normalizedProject } = useFileIntake();
  const analysis = normalizedProject.analysis;

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Power evidence preview"
        title="Power and decoupling evidence"
        description="Phase 8 shows limited power/ground and decoupling evidence only. Power tree analysis begins in Phase 9."
      />
      <div className="notice-panel warning">
        <span className="status-pill">Phase 9 locked</span>
        <p>Power tree analysis begins in Phase 9. Phase 8 does not validate regulator topology, margins, thermals, or power integrity.</p>
      </div>
      {analysis.powerNets.length || analysis.groundNets.length || analysis.decoupling.candidates.length ? (
        <div className="summary-grid">
          <section className="summary-panel">
            <span className="eyebrow">Likely power nets</span>
            <div className="tag-list">
              {analysis.powerNets.length ? analysis.powerNets.map((net) => <span key={net.name}>{net.name}</span>) : <span>Unavailable</span>}
            </div>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Likely ground nets</span>
            <div className="tag-list">
              {analysis.groundNets.length ? analysis.groundNets.map((net) => <span key={net.name}>{net.name}</span>) : <span>Unavailable</span>}
            </div>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Decoupling evidence</span>
            <div className="tag-list">
              <span>Candidates: {analysis.decoupling.candidates.length}</span>
              <span>ICs reviewed: {analysis.decoupling.icPowerPins.length}</span>
              <span>Findings: {analysis.decoupling.findings.length}</span>
            </div>
            <p className="muted">Evidence is heuristic and not full electrical validation.</p>
          </section>
        </div>
      ) : (
        <div className="empty-state">
          <span className="status-pill">No evidence yet</span>
          <p>Upload a supported PCB layout from Intake to show Phase 8 power and decoupling evidence.</p>
          <Link to="/intake" className="primary-action">Open Intake</Link>
        </div>
      )}
      <div className="model-panel">
        <h2>Decoupling candidates</h2>
        <div className="stage-list">
          {analysis.decoupling.candidates.length ? analysis.decoupling.candidates.map((candidate) => (
            <article key={candidate.reference} className="stage-row">
              <div>
                <strong>{candidate.reference}: {candidate.role}</strong>
                <small>{candidate.connectedPowerNet ?? "power unknown"} to {candidate.connectedGroundNet ?? "ground unknown"}</small>
                <small>{candidate.limitations.join(" ")}</small>
              </div>
              <span className="status-pill">{candidate.confidence}</span>
            </article>
          )) : <p className="muted">No decoupling candidates found from current evidence.</p>}
        </div>
      </div>
    </section>
  );
}
