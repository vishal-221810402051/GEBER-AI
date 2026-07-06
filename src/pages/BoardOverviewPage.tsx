import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function BoardOverviewPage() {
  const { kicadPcbResults, normalizedProject } = useFileIntake();
  const parseResult = Object.values(kicadPcbResults)[0];
  const board = normalizedProject.board.kicadPcb;

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
        description="Layout parsed from .kicad_pcb. Schematic validation begins in Phase 5; no electrical analysis has been performed."
      />

      <div className="notice-panel">
        <span className="status-pill">Layout-level only</span>
        <p>
          Board data below is directly parsed from the PCB layout file. It does
          not prove schematic agreement, electrical correctness, manufacturing
          validity, or firmware pin mapping.
        </p>
      </div>

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
