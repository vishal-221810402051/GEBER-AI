import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function ComponentsPage() {
  const { normalizedProject } = useFileIntake();
  const board = normalizedProject.board.kicadPcb;

  if (!board) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Footprint explorer"
          title="Requires KiCad PCB file"
          description="Upload a .kicad_pcb file from Intake to show layout-level footprints. No schematic validation exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">No parsed layout</span>
          <p>Footprints parsed from PCB layout will appear here after a `.kicad_pcb` file is selected.</p>
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
        eyebrow="Footprint explorer"
        title="Footprints parsed from PCB layout"
        description="These are layout-level footprints from the KiCad PCB file. They are not schematic-validated yet."
      />
      <div className="notice-panel">
        <span className="status-pill">Not schematic-validated yet</span>
        <p>
          Reference, value, layer, placement, pads, and pad net references are
          parsed from PCB layout only.
        </p>
      </div>
      <div className="data-table footprint-table">
        <span>Reference</span>
        <span>Value</span>
        <span>Footprint</span>
        <span>Layer</span>
        <span>X</span>
        <span>Y</span>
        <span>Rotation</span>
        <span>Pads</span>
        <span>Pad nets</span>
        {board.footprints.map((footprint, index) => (
          <Fragment key={`${footprint.reference ?? footprint.footprintName}-${index}`}>
            <span>{footprint.reference ?? "Unavailable"}</span>
            <span>{footprint.value ?? "Unavailable"}</span>
            <span>{footprint.footprintName}</span>
            <span>{footprint.layer ?? "Unavailable"}</span>
            <span>{footprint.x ?? "Unavailable"}</span>
            <span>{footprint.y ?? "Unavailable"}</span>
            <span>{footprint.rotation ?? 0}</span>
            <span>{footprint.pads.length}</span>
            <span>
              {footprint.padNetNames.length ? footprint.padNetNames.join(", ") : "Unavailable"}
            </span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
