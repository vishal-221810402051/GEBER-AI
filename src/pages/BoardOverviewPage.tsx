import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { buildPlacementExport, buildPlacementFindingsExport } from "../features/export/buildPlacementExport";
import { tableToCsv } from "../features/export/csv";
import { downloadTextFile } from "../features/export/downloadFile";
import { PageHeader } from "./shared/PageHeader";

export function BoardOverviewPage() {
  const { kicadPcbResults, normalizedProject } = useFileIntake();
  const parseResult = Object.values(kicadPcbResults)[0];
  const board = normalizedProject.board.kicadPcb;
  const placement = normalizedProject.placement.placement;
  const placementAnalysis = normalizedProject.analysis.placement;

  if (parseResult && !parseResult.success) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Board overview"
          title="KiCad PCB parser failed"
          description="The selected .kicad_pcb file could not be parsed. Diagnostics are shown below; no layout facts are available from this file."
        />
        <div className="model-panel">
          <h2>Parser diagnostics</h2>
          <div className="stage-list">
            {parseResult.diagnostics.map((diagnostic, index) => (
              <article key={`${diagnostic.message}-${index}`} className="stage-row">
                <div>
                  <strong>{diagnostic.severity}</strong>
                  <small>{diagnostic.message}</small>
                </div>
                <span className="status-pill">{diagnostic.confidence}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Board overview"
          title="Requires KiCad PCB file"
          description="Upload a .kicad_pcb file from Intake to parse layout-level board data. No schematic validation or electrical analysis exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">KiCad PCB parser waiting</span>
          <p>Requires KiCad PCB file. Upload a `.kicad_pcb` file from Intake.</p>
          <Link to="/intake" className="primary-action">
            Open Intake
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Board overview"
        title="KiCad PCB layout parsed"
        description="Layout parsed from .kicad_pcb. Layout evidence does not prove schematic agreement, electrical correctness, or manufacturing validity."
      />

      <div className="notice-panel">
        <span className="status-pill">Layout-level only</span>
        <p>
          Board data below is directly parsed from the PCB layout file. It does
          not prove schematic agreement, electrical correctness, manufacturing
          validity, or firmware pin mapping.
        </p>
      </div>
      <div className="notice-panel">
        <span className="status-pill">Placement exports</span>
        <div className="hero-actions">
          <button
            type="button"
            className="secondary-action"
            disabled={!placementAnalysis.available}
            onClick={() => downloadTextFile("geberai-placement-summary.csv", tableToCsv(buildPlacementExport(normalizedProject.analysis)), "text/csv")}
          >
            Export Placement CSV
          </button>
          <button
            type="button"
            className="secondary-action"
            disabled={placementAnalysis.findings.length === 0}
            onClick={() => downloadTextFile("geberai-placement-findings.csv", tableToCsv(buildPlacementFindingsExport(normalizedProject.analysis)), "text/csv")}
          >
            Export Placement Findings CSV
          </button>
        </div>
      </div>

      {normalizedProject.schematic.kicadSchematic ? (
        <div className="notice-panel">
          <span className="status-pill">Schematic data exists</span>
          <p>
            A KiCad schematic has been parsed, but schematic-to-PCB comparison
            is future work and is not shown on this board page.
          </p>
        </div>
      ) : null}

      {placement ? (
        <div className="summary-panel">
          <span className="eyebrow">Placement table parsed</span>
          <div className="tag-list">
            <span>Rows: {placement.summary.rowCount}</span>
            <span>Top: {placement.summary.topSideCount}</span>
            <span>Bottom: {placement.summary.bottomSideCount}</span>
            <span>Unknown: {placement.summary.unknownSideCount}</span>
          </div>
          <p className="muted">
            Placement data is not compared against PCB coordinates yet.
          </p>
        </div>
      ) : null}

      <section className="summary-panel">
        <span className="eyebrow">Placement analysis</span>
        <div className="tag-list">
          <span>Components reviewed: {placementAnalysis.components.length}</span>
          <span>PCB only: {placementAnalysis.coordinateSourceSummary.pcbOnly}</span>
          <span>Pick-place only: {placementAnalysis.coordinateSourceSummary.placementOnly}</span>
          <span>Both sources: {placementAnalysis.coordinateSourceSummary.both}</span>
          <span>Missing coordinates: {placementAnalysis.coordinateSourceSummary.missingCoordinates}</span>
          <span>Findings: {placementAnalysis.findings.length}</span>
        </div>
        <p className="muted">
          Placement findings are heuristic and evidence-based. Assembly and manufacturing validation are not complete.
        </p>
      </section>

      {normalizedProject.netInventory.available ? (
        <div className="summary-panel">
          <span className="eyebrow">Net inventory summary</span>
          <div className="tag-list">
            <span>Nets: {normalizedProject.netInventory.summary.totalNets}</span>
            <span>Power: {normalizedProject.netInventory.summary.powerNets}</span>
            <span>Ground: {normalizedProject.netInventory.summary.groundNets}</span>
            <span>Unknown: {normalizedProject.netInventory.summary.unknownNets}</span>
          </div>
          <p className="muted">
            Net classification is name-based and not electrical validation.
          </p>
        </div>
      ) : null}

      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Metadata</span>
          <p>Version: {board.metadata.version ?? "Unavailable"}</p>
          <p>Generator: {board.metadata.generator ?? "Unavailable"}</p>
          <p>Paper: {board.metadata.paper ?? "Unavailable"}</p>
          <p>Thickness: {board.metadata.thickness ?? "Unavailable"}</p>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Board summary</span>
          <div className="tag-list">
            <span>Layers: {board.summary.layerCount}</span>
            <span>Copper: {board.summary.copperLayerCount}</span>
            <span>Nets: {board.summary.netCount}</span>
            <span>Footprints: {board.summary.footprintCount}</span>
            <span>Pads: {board.summary.padCount}</span>
            <span>Tracks: {board.summary.trackSegmentCount}</span>
            <span>Vias: {board.summary.viaCount}</span>
            <span>Zones: {board.summary.zoneCount}</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Outline</span>
          <p>Status: {board.summary.outlineStatus}</p>
          <p>Edge.Cuts primitives: {board.summary.edgeCutsPrimitiveCount}</p>
          <p>
            Dimensions:{" "}
            {board.summary.boundingBox
              ? `${board.summary.boundingBox.width.toFixed(2)} x ${board.summary.boundingBox.height.toFixed(2)}`
              : "Unavailable"}
          </p>
        </section>
      </div>

      <section className="model-panel">
        <h2>Placement quality findings</h2>
        <div className="stage-list">
          {placementAnalysis.findings.length ? placementAnalysis.findings.map((finding) => (
            <article key={finding.id} className="stage-row">
              <div>
                <strong>{finding.title}</strong>
                <small>{finding.recommendation}</small>
                <small>{finding.limitations.join(" ")}</small>
              </div>
              <span className="status-pill">{finding.placementCategory}</span>
              <span className="status-pill">{finding.confidence}</span>
            </article>
          )) : <p className="muted">No placement findings generated from current evidence.</p>}
        </div>
      </section>

      <section className="model-panel">
        <h2>Layer table</h2>
        <div className="data-table layer-table">
          <span>ID</span>
          <span>Name</span>
          <span>Type</span>
          <span>Function</span>
          {board.layers.map((layer) => (
            <Fragment key={layer.id}>
              <span>{layer.id}</span>
              <span>{layer.name}</span>
              <span>{layer.type}</span>
              <span>{layer.function ?? "Unavailable"}</span>
            </Fragment>
          ))}
        </div>
      </section>

      <section className="model-panel">
        <h2>Parser diagnostics</h2>
        <div className="stage-list">
          {board.diagnostics.length > 0 ? (
            board.diagnostics.map((diagnostic, index) => (
              <article key={`${diagnostic.message}-${index}`} className="stage-row">
                <div>
                  <strong>{diagnostic.severity}</strong>
                  <small>{diagnostic.message}</small>
                </div>
                <span className="status-pill">{diagnostic.confidence}</span>
              </article>
            ))
          ) : (
            <p className="muted">No parser diagnostics reported.</p>
          )}
        </div>
      </section>
    </section>
  );
}
