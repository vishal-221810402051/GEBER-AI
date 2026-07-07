import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function PowerPage() {
  const { normalizedProject } = useFileIntake();
  const powerTree = normalizedProject.analysis.powerTree;

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Phase 9 power tree"
        title="Evidence-based power tree analysis"
        description="Power tree analysis is evidence-based and does not verify regulator sizing, thermal margin, or datasheet correctness."
      />

      <div className="notice-panel warning">
        <span className="status-pill">Not validation</span>
        <p>
          Phase 9 does not claim power design validity, regulator margin, thermal
          safety, production readiness, or firmware mapping.
        </p>
      </div>

      {!powerTree.available ? (
        <div className="empty-state">
          <span className="status-pill">No power tree evidence</span>
          <p>Upload supported PCB, schematic, and BOM files from Intake to build power-tree evidence.</p>
          <Link to="/intake" className="primary-action">Open Intake</Link>
        </div>
      ) : (
        <>
          <div className="summary-grid">
            <section className="summary-panel">
              <span className="eyebrow">Power summary</span>
              <div className="tag-list">
                <span>Rails: {powerTree.rails.length}</span>
                <span>Regulators: {powerTree.regulators.length}</span>
                <span>Inputs: {powerTree.inputs.length}</span>
                <span>Protection: {powerTree.protection.length}</span>
                <span>Findings: {powerTree.findings.length}</span>
              </div>
            </section>
            <section className="summary-panel">
              <span className="eyebrow">Confidence limitations</span>
              <p className="muted">{powerTree.limitations.join(" ")}</p>
            </section>
          </div>

          <section className="model-panel">
            <h2>Power rails</h2>
            <div className="data-table power-rail-table">
              <span>Rail</span>
              <span>Type</span>
              <span>Sources</span>
              <span>Loads</span>
              <span>Pads</span>
              <span>Segments</span>
              <span>Vias</span>
              <span>Zone</span>
              <span>Decoupling</span>
              {powerTree.rails.map((rail) => (
                <Fragment key={rail.name}>
                  <span>{rail.name}</span>
                  <span>{rail.railType}</span>
                  <span>{rail.sourceCandidates.join(", ") || "No source candidate"}</span>
                  <span>{rail.loadCandidates.length}</span>
                  <span>{rail.connectedPads}</span>
                  <span>{rail.segmentCount}</span>
                  <span>{rail.viaCount}</span>
                  <span>{rail.zonePresent ? "zone evidence" : "none"}</span>
                  <span>{rail.relatedDecouplingCapacitors.join(", ") || "none"}</span>
                </Fragment>
              ))}
            </div>
          </section>

          <div className="model-grid">
            <section className="model-panel">
              <h2>Regulator candidates</h2>
              <div className="stage-list">
                {powerTree.regulators.length ? powerTree.regulators.map((regulator) => (
                  <article key={regulator.reference} className="stage-row">
                    <div>
                      <strong>{regulator.reference}: {regulator.value ?? "value unavailable"}</strong>
                      <small>Power nets: {regulator.connectedPowerNets.join(", ") || "unavailable"}</small>
                      <small>Possible input: {regulator.possibleInputRail ?? "unknown"} | output: {regulator.possibleOutputRail ?? "unknown"}</small>
                    </div>
                    <span className="status-pill">{regulator.confidence}</span>
                  </article>
                )) : <p className="muted">No regulator candidates detected.</p>}
              </div>
            </section>

            <section className="model-panel">
              <h2>Power input and protection candidates</h2>
              <div className="stage-list">
                {[...powerTree.inputs.map((item) => `${item.reference ?? "Net"} ${item.netName} (${item.inputType})`), ...powerTree.protection.map((item) => `${item.reference} (${item.protectionType})`)].length ? (
                  <>
                    {powerTree.inputs.map((input) => (
                      <article key={`${input.reference ?? "input"}-${input.netName}`} className="stage-row">
                        <div>
                          <strong>{input.reference ?? input.netName}</strong>
                          <small>{input.inputType} candidate on {input.netName}</small>
                        </div>
                        <span className="status-pill">{input.confidence}</span>
                      </article>
                    ))}
                    {powerTree.protection.map((protection) => (
                      <article key={protection.reference} className="stage-row">
                        <div>
                          <strong>{protection.reference}</strong>
                          <small>{protection.protectionType} candidate; nets: {protection.connectedNets.join(", ") || "unavailable"}</small>
                        </div>
                        <span className="status-pill">{protection.confidence}</span>
                      </article>
                    ))}
                  </>
                ) : <p className="muted">No input or protection candidates detected.</p>}
              </div>
            </section>
          </div>

          <section className="model-panel">
            <h2>Power budget evidence</h2>
            <div className="data-table power-budget-table">
              <span>Rail</span>
              <span>Known loads</span>
              <span>Unknown loads</span>
              <span>Explicit current values</span>
              <span>Estimated current</span>
              <span>Confidence</span>
              {powerTree.budgets.map((budget) => (
                <Fragment key={budget.railName}>
                  <span>{budget.railName}</span>
                  <span>{budget.knownLoadCount}</span>
                  <span>{budget.unknownLoadCount}</span>
                  <span>{budget.explicitCurrentValues.join(", ") || "None parsed"}</span>
                  <span>{budget.estimatedCurrent}</span>
                  <span>{budget.confidence}</span>
                </Fragment>
              ))}
            </div>
          </section>

          <section className="model-panel">
            <h2>Power findings</h2>
            <div className="stage-list">
              {powerTree.findings.map((finding) => (
                <article key={finding.id} className="stage-row">
                  <div>
                    <strong>{finding.title}</strong>
                    <small>{finding.recommendation}</small>
                    <small>{finding.limitations.join(" ")}</small>
                  </div>
                  <span className="status-pill">{finding.severity}</span>
                  <span className="status-pill">{finding.confidence}</span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
