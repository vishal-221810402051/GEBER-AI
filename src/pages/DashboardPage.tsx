import { Link } from "react-router-dom";
import { PlannedCard } from "../components/cards/PlannedCard";
import { formatFileSize } from "../features/intake/formatFileSize";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

const plannedCards = [
  "Parser confidence",
  "Components",
  "Nets",
  "Critical issues",
  "BOM status",
  "Firmware report status"
];

export function DashboardPage() {
  const {
    completeness,
    files,
    bomResults,
    kicadPcbResults,
    kicadSchematicResults,
    normalizedProject,
    placementResults,
    totalSizeBytes
  } = useFileIntake();
  const parserResult = Object.values(kicadPcbResults)[0];
  const schematicResult = Object.values(kicadSchematicResults)[0];
  const bomResult = Object.values(bomResults)[0];
  const placementResult = Object.values(placementResults)[0];
  const netInventory = normalizedProject.netInventory;
  const analysis = normalizedProject.analysis;
  const warningCounts = normalizedProject.missingDataWarnings.reduce(
    (counts, warning) => ({
      ...counts,
      [warning.severity]: (counts[warning.severity] ?? 0) + 1
    }),
    {} as Record<string, number>
  );

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Project dashboard"
        description="Dashboard summary for local parsed evidence, normalized nets, and Phase 9 heuristic placement and power-tree analysis."
      />

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="status-pill">No project package uploaded yet</span>
          <p>
            Start from Intake to select files for local metadata classification.
          </p>
          <Link to="/intake" className="primary-action">
            Start from Intake
          </Link>
        </div>
      ) : (
        <div className="summary-grid">
          <section className="summary-panel">
            <span className="eyebrow">Normalized project summary</span>
            <div className="metric-row">
              <strong>{normalizedProject.name}</strong>
              <span>{normalizedProject.selectedMode}</span>
            </div>
            <p className="muted">
              Content parsing not implemented yet. This project summary is
              metadata-level only.
            </p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Completeness score</span>
            <div className="score-meter" aria-label="File completeness score">
              <div style={{ width: `${completeness.score}%` }} />
            </div>
            <div className="metric-row">
              <strong>{completeness.score}/100</strong>
              <span>{completeness.readinessLabel}</span>
            </div>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Parser stage status</span>
            <div className="metric-row">
              <strong>
                {
                  normalizedProject.parserResult.stages.filter(
                    (stage) => stage.status === "metadata-classified"
                  ).length
                }
              </strong>
              <span>metadata-classified</span>
            </div>
            <p className="muted">
              Future parser stages are modeled, not executed.
            </p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Uploaded files</span>
            <div className="metric-row">
              <strong>{files.length}</strong>
              <span>{formatFileSize(totalSizeBytes)}</span>
            </div>
            <p className="muted">Classification is extension/name based only.</p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Warning counts</span>
            <div className="tag-list">
              {["critical", "high", "medium", "low", "info"].map((severity) => (
                <span key={severity}>
                  {severity}: {warningCounts[severity] ?? 0}
                </span>
              ))}
            </div>
          </section>
          {parserResult ? (
            <section className="summary-panel">
              <span className="eyebrow">Phase 4 PCB parser</span>
              <div className="tag-list">
                <span>Status: {parserResult.success ? "parsed" : "failed"}</span>
                <span>Layers: {parserResult.summary.layerCount}</span>
                <span>Nets: {parserResult.summary.netCount}</span>
                <span>Footprints: {parserResult.summary.footprintCount}</span>
                <span>Vias: {parserResult.summary.viaCount}</span>
                <span>Diagnostics: {parserResult.diagnostics.length}</span>
              </div>
              <p className="muted">
                Parsed PCB summary is layout-level only. No schematic validation
                or electrical analysis has been performed.
              </p>
            </section>
          ) : null}
          {schematicResult ? (
            <section className="summary-panel">
              <span className="eyebrow">Phase 5 schematic parser</span>
              <div className="tag-list">
                <span>Status: {schematicResult.success ? "parsed" : "failed"}</span>
                <span>Symbols: {schematicResult.summary.symbolInstanceCount}</span>
                <span>Labels: {schematicResult.summary.labelCount}</span>
                <span>Wires: {schematicResult.summary.wireCount}</span>
                <span>Global labels: {schematicResult.summary.globalLabelCount}</span>
                <span>No-connects: {schematicResult.summary.noConnectCount}</span>
                <span>Diagnostics: {schematicResult.diagnostics.length}</span>
              </div>
              <p className="muted">
                Parsed schematic summary is schematic-level only. Schematic
                validation against PCB layout is not complete.
              </p>
            </section>
          ) : null}
          {bomResult || placementResult ? (
            <section className="summary-panel">
              <span className="eyebrow">Phase 6 table parsers</span>
              <div className="tag-list">
                {bomResult ? (
                  <>
                    <span>BOM: {bomResult.unsupported ? "unsupported" : bomResult.success ? "parsed" : "failed"}</span>
                    <span>BOM rows: {bomResult.summary.rowCount}</span>
                    <span>BOM refs: {bomResult.summary.parsedReferenceCount}</span>
                  </>
                ) : null}
                {placementResult ? (
                  <>
                    <span>Placement: {placementResult.success ? "parsed" : "failed"}</span>
                    <span>Rows: {placementResult.summary.rowCount}</span>
                    <span>Top: {placementResult.summary.topSideCount}</span>
                    <span>Bottom: {placementResult.summary.bottomSideCount}</span>
                    <span>Unknown: {placementResult.summary.unknownSideCount}</span>
                  </>
                ) : null}
              </div>
              <p className="muted">Not PCB-validated yet. No fake validation issue counts are shown.</p>
            </section>
          ) : null}
          {netInventory.available ? (
            <section className="summary-panel">
              <span className="eyebrow">Phase 7 net inventory</span>
              <div className="tag-list">
                <span>Total nets: {netInventory.summary.totalNets}</span>
                <span>Classified: {netInventory.summary.classifiedNets}</span>
                <span>Unknown: {netInventory.summary.unknownNets}</span>
                <span>Power: {netInventory.summary.powerNets}</span>
                <span>Ground: {netInventory.summary.groundNets}</span>
                <span>Communication: {netInventory.summary.communicationNets}</span>
                <span>Diagnostics: {netInventory.summary.diagnosticsCount + netInventory.diagnostics.length}</span>
              </div>
              <p className="muted">
                Classification is name-based and not electrical validation.
              </p>
            </section>
          ) : null}
          <section className="summary-panel">
            <span className="eyebrow">Phase 8 analysis</span>
            <div className="tag-list">
              <span>ICs reviewed: {analysis.summary.icCountReviewed}</span>
              <span>Decoupling evidence: {analysis.summary.decouplingEvidenceFound}</span>
              <span>Missing decoupling evidence: {analysis.summary.decouplingMissingEvidence}</span>
              <span>Pull-ups: {analysis.summary.pullUpCandidates}</span>
              <span>Pull-downs: {analysis.summary.pullDownCandidates}</span>
              <span>Bias warnings: {analysis.summary.biasWarnings}</span>
              <span>Limitations: {analysis.summary.confidenceLimitations}</span>
            </div>
            <p className="muted">
              Phase 8 analysis is heuristic and evidence-based. It is not full electrical validation.
            </p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Phase 9 analysis</span>
            <div className="tag-list">
              <span>Placement reviewed: {analysis.summary.placementComponentsReviewed}</span>
              <span>Placement findings: {analysis.summary.placementFindings}</span>
              <span>Power rails: {analysis.summary.powerRailsDetected}</span>
              <span>Regulators: {analysis.summary.regulatorCandidates}</span>
              <span>Power inputs: {analysis.summary.powerInputCandidates}</span>
              <span>Power findings: {analysis.summary.powerFindings}</span>
              <span>Unknown current loads: {analysis.summary.unknownCurrentLoads}</span>
            </div>
            <p className="muted">
              Phase 9 does not verify regulator sizing, thermal margin, manufacturing validity, or production readiness.
            </p>
          </section>
        </div>
      )}

      <div className="card-grid dashboard-grid">
        {plannedCards.map((title) => (
          <PlannedCard
            key={title}
            title={title}
            status="Parser not implemented"
            description="Requires future content parsing and normalized project data. No fake project data is displayed."
          />
        ))}
      </div>
    </section>
  );
}
