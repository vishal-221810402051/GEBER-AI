import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function NetsPage() {
  const { normalizedProject } = useFileIntake();
  const board = normalizedProject.board.kicadPcb;

  if (!board) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Net explorer"
          title="Requires KiCad PCB file"
          description="Upload a .kicad_pcb file from Intake to show PCB net declarations. No schematic comparison exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">No parsed layout</span>
          <p>Nets parsed from PCB layout will appear here after a `.kicad_pcb` file is selected.</p>
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
        title="Nets parsed from PCB layout"
        description="Net declarations and layout references are parsed from the KiCad PCB file. No schematic comparison yet."
      />
      <div className="notice-panel">
        <span className="status-pill">Layout-level only</span>
        <p>
          Pad, segment, and via references are PCB layout facts only. They are
          not electrical analysis findings.
        </p>
      </div>
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
  );
}
