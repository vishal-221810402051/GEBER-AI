import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function ComponentsPage() {
  const { normalizedProject } = useFileIntake();
  const board = normalizedProject.board.kicadPcb;
  const schematic = normalizedProject.schematic.kicadSchematic;
  const bom = normalizedProject.bom.bom;
  const analysis = normalizedProject.analysis;

  function roleFor(reference?: string) {
    return reference
      ? analysis.componentRoles.find((role) => role.reference.toUpperCase() === reference.toUpperCase())
      : undefined;
  }

  function decouplingFor(reference?: string) {
    return reference
      ? analysis.decoupling.icPowerPins.find((ic) => ic.reference.toUpperCase() === reference.toUpperCase())
      : undefined;
  }

  function capacitorFor(reference?: string) {
    return reference
      ? analysis.decoupling.candidates.find((candidate) => candidate.reference.toUpperCase() === reference.toUpperCase())
      : undefined;
  }

  function pullFor(reference?: string) {
    return reference
      ? analysis.pullResistors.candidates.find((candidate) => candidate.reference.toUpperCase() === reference.toUpperCase())
      : undefined;
  }

  function placementFor(reference?: string) {
    return reference
      ? analysis.placement.components.find((component) => component.reference.toUpperCase() === reference.toUpperCase())
      : undefined;
  }

  function railsFor(reference?: string) {
    return reference
      ? analysis.powerTree.rails.filter((rail) => rail.connectedComponents.some((component) => component.toUpperCase() === reference.toUpperCase()))
      : [];
  }

  function findingCounts(reference?: string) {
    if (!reference) {
      return { placement: 0, power: 0 };
    }
    const key = reference.toUpperCase();
    return {
      placement: analysis.placement.findings.filter((finding) =>
        finding.affectedComponent?.toUpperCase() === key || finding.relatedComponents.some((item) => item.toUpperCase() === key)
      ).length,
      power: analysis.powerTree.findings.filter((finding) =>
        finding.affectedComponent?.toUpperCase() === key || finding.relatedComponents.some((item) => item.toUpperCase() === key)
      ).length
    };
  }

  function firmwareInvolvement(reference?: string) {
    const manual = normalizedProject.firmware.manual;
    if (!reference || !manual) {
      return "No firmware involvement";
    }
    const isMcu = manual.mcuCandidates.some((candidate) => candidate.reference.toUpperCase() === reference.toUpperCase());
    const pins = manual.pinMap.filter((entry) => entry.connectedComponentReferences.some((item) => item.toUpperCase() === reference.toUpperCase()));
    const connector = manual.connectors.find((item) => item.reference.toUpperCase() === reference.toUpperCase());
    return [
      isMcu ? "MCU candidate" : undefined,
      pins.length ? `${pins.length} firmware net(s)` : undefined,
      connector ? "Connector pinout" : undefined
    ].filter(Boolean).join("; ") || "No firmware involvement";
  }

  if (!board && !schematic && !bom) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Footprint explorer"
          title="Requires KiCad PCB file"
          description="Upload KiCad or BOM files from Intake to show layout footprints, schematic symbols, or BOM rows. No comparison exists yet."
        />
        <div className="empty-state">
          <span className="status-pill">No parsed layout</span>
          <p>PCB footprints, schematic symbols, and BOM rows will appear here after supported files are selected.</p>
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
        <span className="status-pill">Heuristic only</span>
        <p>
          Component roles, placement evidence, and power-tree involvement are
          deterministic heuristics from parsed files. They are not full
          manufacturing validation or full electrical validation.
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
            <span>Role</span>
            <span>Phase 8 evidence</span>
            <span>Placement</span>
            <span>Power rails</span>
            <span>Findings</span>
            <span>Firmware</span>
            {board.footprints.map((footprint, index) => (
              <Fragment key={`${footprint.reference ?? footprint.footprintName}-${index}`}>
                {(() => {
                  const role = roleFor(footprint.reference);
                  const ic = decouplingFor(footprint.reference);
                  const cap = capacitorFor(footprint.reference);
                  const pull = pullFor(footprint.reference);
                  const evidenceLabel =
                    ic ? `Decoupling: ${ic.decouplingStatus}` :
                    cap ? `Capacitor: ${cap.role}` :
                    pull ? `${pull.biasType}: ${pull.signalNet}` :
                    "No Phase 8 candidate";
                  const placement = placementFor(footprint.reference);
                  const rails = railsFor(footprint.reference);
                  const counts = findingCounts(footprint.reference);
                  return (
                    <>
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
                <span>{role?.role ?? "unknown"}</span>
                <span>{evidenceLabel}</span>
                <span>
                  {placement ? `${placement.source}; ${placement.x ?? "x?"}, ${placement.y ?? "y?"}; ${placement.side}` : "Unavailable"}
                </span>
                <span>{rails.map((rail) => rail.name).join(", ") || "None detected"}</span>
                <span>Placement {counts.placement}; Power {counts.power}</span>
                <span>{firmwareInvolvement(footprint.reference)}</span>
                    </>
                  );
                })()}
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
            <span>Role</span>
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
                <span>{roleFor(symbol.reference)?.role ?? "unknown"}</span>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}

      {bom && !bom.unsupported ? (
        <section className="model-panel">
          <h2>BOM rows parsed from BOM</h2>
          <p className="muted">BOM table-level data only. No component validation yet.</p>
          <div className="data-table bom-component-table">
            <span>Refs</span>
            <span>Qty</span>
            <span>Value</span>
            <span>Footprint/package</span>
            <span>MPN</span>
            <span>Supplier PN</span>
            <span>Role</span>
            {bom.rows.map((row) => (
              <Fragment key={row.rowIndex}>
                <span>{row.referenceDesignatorsRaw ?? "Unavailable"}</span>
                <span>{row.quantity ?? "Unavailable"}</span>
                <span>{row.value ?? "Unavailable"}</span>
                <span>{row.footprint ?? "Unavailable"}</span>
                <span>{row.manufacturerPartNumber ?? "Unavailable"}</span>
                <span>{row.supplierPartNumber ?? "Unavailable"}</span>
                <span>
                  {row.referenceDesignators.map((reference) => roleFor(reference)?.role ?? "unknown").join(", ") || "unknown"}
                </span>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
