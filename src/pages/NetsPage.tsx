import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function NetsPage() {
  const { normalizedProject } = useFileIntake();
  const board = normalizedProject.board.kicadPcb;
  const schematic = normalizedProject.schematic.kicadSchematic;

  if (!board && !schematic) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Net explorer"
          title="Requires KiCad PCB file"
          description="Upload a .kicad_pcb or .kicad_sch file from Intake to show PCB net declarations or schematic connectivity primitives. No comparison exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">No parsed layout</span>
          <p>PCB nets and schematic labels/connectivity primitives will appear here after supported KiCad files are selected.</p>
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
        eyebrow="Net explorer"
        title="PCB nets and schematic connectivity primitives"
        description="Layout net declarations and schematic labels are displayed separately. Full net solving and PCB comparison are not implemented yet."
      />
      <div className="notice-panel">
        <span className="status-pill">Layout-level only</span>
        <p>
          Pad, segment, via, label, wire, junction, and no-connect references
          are parsed primitives only. They are not electrical analysis findings.
        </p>
      </div>
      {board ? (
        <section className="model-panel">
          <h2>Nets parsed from PCB layout</h2>
          <div className="data-table nets-table">
            <span>ID</span>
            <span>Name</span>
            <span>Pad refs</span>
            <span>Segment refs</span>
            <span>Via refs</span>
            {board.nets.map((net) => {
              const padRefs = board.footprints.reduce(
                (count, footprint) =>
                  count + footprint.pads.filter((pad) => pad.netId === net.id).length,
                0
              );
              const segmentRefs = board.trackSegments.filter(
                (segment) => segment.netId === net.id
              ).length;
              const viaRefs = board.vias.filter((via) => via.netId === net.id).length;

              return (
                <Fragment key={net.id}>
                  <span>{net.id}</span>
                  <span>{net.name || "(unnamed)"}</span>
                  <span>{padRefs}</span>
                  <span>{segmentRefs}</span>
                  <span>{viaRefs}</span>
                </Fragment>
              );
            })}
          </div>
        </section>
      ) : null}

      {schematic ? (
        <section className="model-panel">
          <h2>Schematic labels and connectivity primitives</h2>
          <p className="muted">
            Connectivity primitives parsed. Net solving is not complete. Not
            PCB-compared yet.
          </p>
          <div className="tag-list">
            <span>Labels: {schematic.summary.labelCount}</span>
            <span>Global labels: {schematic.summary.globalLabelCount}</span>
            <span>Hierarchical labels: {schematic.summary.hierarchicalLabelCount}</span>
            <span>Wires: {schematic.summary.wireCount}</span>
            <span>Junctions: {schematic.summary.junctionCount}</span>
            <span>No-connects: {schematic.summary.noConnectCount}</span>
          </div>
          <div className="data-table schematic-label-table">
            <span>Kind</span>
            <span>Name</span>
            <span>X</span>
            <span>Y</span>
            <span>Rotation</span>
            <span>Shape</span>
            {schematic.labels.map((label, index) => (
              <Fragment key={`${label.kind}-${label.name}-${index}`}>
                <span>{label.kind}</span>
                <span>{label.name}</span>
                <span>{label.x ?? "Unavailable"}</span>
                <span>{label.y ?? "Unavailable"}</span>
                <span>{label.rotation ?? 0}</span>
                <span>{label.shape ?? "Unavailable"}</span>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
