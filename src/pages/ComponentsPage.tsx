import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function ComponentsPage() {
  const { normalizedProject } = useFileIntake();
  const board = normalizedProject.board.kicadPcb;
  const schematic = normalizedProject.schematic.kicadSchematic;

  if (!board && !schematic) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Footprint explorer"
          title="Requires KiCad PCB file"
          description="Upload a .kicad_pcb or .kicad_sch file from Intake to show layout-level footprints or schematic symbols. No comparison exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">No parsed layout</span>
          <p>PCB footprints and schematic symbols will appear here after supported KiCad files are selected.</p>
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
        eyebrow="Component explorer"
        title="KiCad layout footprints and schematic symbols"
        description="These tables are shown separately and are not compared yet."
      />
      <div className="notice-panel">
        <span className="status-pill">Not compared yet</span>
        <p>
          PCB footprints are parsed from layout and schematic symbols are parsed
          from schematic. Phase 5 does not claim these tables match.
        </p>
      </div>

      {board ? (
        <section className="model-panel">
          <h2>PCB footprints parsed from layout</h2>
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
      ) : null}

      {schematic ? (
        <section className="model-panel">
          <h2>Schematic symbols parsed from schematic</h2>
          <div className="data-table schematic-symbol-table">
            <span>Reference</span>
            <span>Value</span>
            <span>Library ID</span>
            <span>Footprint property</span>
            <span>In BOM</span>
            <span>On board</span>
            <span>X</span>
            <span>Y</span>
            <span>Rotation</span>
            <span>UUID</span>
            {schematic.symbols.map((symbol, index) => (
              <Fragment key={`${symbol.uuid ?? symbol.reference ?? "symbol"}-${index}`}>
                <span>{symbol.reference ?? "Unavailable"}</span>
                <span>{symbol.value ?? "Unavailable"}</span>
                <span>{symbol.libId ?? "Unavailable"}</span>
                <span>{symbol.footprint ?? "Unavailable"}</span>
                <span>{symbol.inBom === undefined ? "Unavailable" : String(symbol.inBom)}</span>
                <span>{symbol.onBoard === undefined ? "Unavailable" : String(symbol.onBoard)}</span>
                <span>{symbol.x ?? "Unavailable"}</span>
                <span>{symbol.y ?? "Unavailable"}</span>
                <span>{symbol.rotation ?? 0}</span>
                <span>{symbol.uuid ?? "Unavailable"}</span>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
