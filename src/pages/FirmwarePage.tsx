import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

export function FirmwarePage() {
  const { normalizedProject } = useFileIntake();
  const manual = normalizedProject.firmware.manual;
  const [mcuFilter, setMcuFilter] = useState("all");
  const [peripheralFilter, setPeripheralFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");

  const filteredPins = useMemo(
    () =>
      (manual?.pinMap ?? []).filter((entry) => {
        const mcuMatch = mcuFilter === "all" || entry.mcuReference === mcuFilter;
        const peripheralMatch = peripheralFilter === "all" || entry.peripheralClassification === peripheralFilter;
        const confidenceMatch = confidenceFilter === "all" || entry.confidence === confidenceFilter;
        return mcuMatch && peripheralMatch && confidenceMatch;
      }),
    [confidenceFilter, manual?.pinMap, mcuFilter, peripheralFilter]
  );

  if (!manual || !manual.available) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Firmware guidance"
          title="Requires schematic and/or PCB evidence"
          description="Firmware pin mapping cannot be trusted without schematic and PCB net data."
        />
        <div className="empty-state">
          <span className="status-pill">Firmware guidance unavailable</span>
          <p>Requires `.kicad_sch` and/or `.kicad_pcb` files.</p>
          <Link to="/intake" className="primary-action">Open Intake</Link>
        </div>
      </section>
    );
  }

  const peripheralTypes = Array.from(new Set(manual.pinMap.map((entry) => entry.peripheralClassification))).sort();
  const confidences = Array.from(new Set(manual.pinMap.map((entry) => entry.confidence))).sort();

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Firmware guidance"
        title="Firmware engineering manual"
        description="Firmware Mode is guidance only and requires datasheet review. It does not claim firmware correctness or production readiness."
      />

      <div className="notice-panel warning">
        <span className="status-pill">Guidance only</span>
        <p>
          Pin mapping is not guaranteed correct. MCU configuration is not
          validated. Schematic-to-PCB validation and electrical validation are
          not complete.
        </p>
      </div>

      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Firmware Mode Summary</span>
          <div className="tag-list">
            <span>Readiness: {manual.summary.readiness}</span>
            <span>MCUs: {manual.summary.mcuCandidates}</span>
            <span>Pin entries: {manual.summary.pinMapEntries}</span>
            <span>Peripherals: {manual.summary.peripheralGroups}</span>
            <span>Connectors: {manual.summary.connectorPinouts}</span>
            <span>Checklist items: {manual.summary.checklistItems}</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Data Sources and Confidence</span>
          <p className="muted">{manual.limitations.join(" ")}</p>
        </section>
      </div>

      <section className="model-panel">
        <h2>MCU / programmable IC candidates</h2>
        <div className="stage-list">
          {manual.mcuCandidates.map((candidate) => (
            <article key={candidate.reference} className="stage-row">
              <div>
                <strong>{candidate.reference}: {candidate.value ?? "value unavailable"}</strong>
                <small>{candidate.candidateType} | {candidate.footprint ?? candidate.libraryId ?? "metadata unavailable"}</small>
                <small>{candidate.limitations.join(" ")}</small>
              </div>
              <span className="status-pill">{candidate.confidence}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="filter-bar">
        <select value={mcuFilter} onChange={(event) => setMcuFilter(event.target.value)}>
          <option value="all">All MCU candidates</option>
          {manual.mcuCandidates.map((candidate) => (
            <option key={candidate.reference} value={candidate.reference}>{candidate.reference}</option>
          ))}
        </select>
        <select value={peripheralFilter} onChange={(event) => setPeripheralFilter(event.target.value)}>
          <option value="all">All peripheral classes</option>
          {peripheralTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={confidenceFilter} onChange={(event) => setConfidenceFilter(event.target.value)}>
          <option value="all">All confidence</option>
          {confidences.map((confidence) => (
            <option key={confidence} value={confidence}>{confidence}</option>
          ))}
        </select>
      </div>

      <section className="model-panel">
        <h2>Pin mapping table</h2>
        <div className="data-table firmware-pin-table">
          <span>MCU</span>
          <span>Physical pin</span>
          <span>Symbol pin</span>
          <span>Port/pin</span>
          <span>Net</span>
          <span>Peripheral</span>
          <span>Direction</span>
          <span>Pull evidence</span>
          <span>Confidence</span>
          {filteredPins.map((entry, index) => (
            <Fragment key={`${entry.mcuReference}-${entry.physicalPin}-${entry.netName ?? index}`}>
              <span>{entry.mcuReference}</span>
              <span>{entry.physicalPin}</span>
              <span>{entry.symbolPinName}</span>
              <span>{entry.portPinName ?? "Unavailable"}</span>
              <span>{entry.netName ?? "Unavailable"}</span>
              <span>{entry.peripheralClassification}</span>
              <span>{entry.direction}</span>
              <span>{entry.pullEvidence.join(", ") || "None detected"}</span>
              <span>{entry.confidence}</span>
            </Fragment>
          ))}
        </div>
      </section>

      <div className="model-grid">
        <section className="model-panel">
          <h2>Peripheral and bus map</h2>
          <div className="stage-list">
            {manual.peripherals.map((peripheral) => (
              <article key={peripheral.peripheralType} className="stage-row">
                <div>
                  <strong>{peripheral.peripheralType}</strong>
                  <small>Nets: {peripheral.nets.join(", ") || "unknown"}</small>
                  <small>{peripheral.configurationNotes.join(" ")}</small>
                </div>
                <span className="status-pill">{peripheral.confidence}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="model-panel">
          <h2>Suggested driver modules</h2>
          <div className="stage-list">
            {manual.driverSuggestions.map((suggestion) => (
              <article key={suggestion.moduleName} className="stage-row">
                <div>
                  <strong>{suggestion.moduleName}</strong>
                  <small>{suggestion.whySuggested}</small>
                  <small>{suggestion.limitation}</small>
                </div>
                <span className="status-pill">{suggestion.confidence}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="model-panel">
        <h2>Connector pinout map</h2>
        <div className="stage-list">
          {manual.connectors.length ? manual.connectors.map((connector) => (
            <article key={connector.reference} className="stage-row">
              <div>
                <strong>{connector.reference}: {connector.value ?? connector.footprint ?? "connector"}</strong>
                <small>{connector.pins.length} pin(s), {connector.side} side, confidence {connector.confidence}</small>
                <small>Connector pinout inferred from PCB pad-net data. Requires schematic and datasheet review before firmware use.</small>
              </div>
            </article>
          )) : <p className="muted">No connector pinout candidates detected.</p>}
        </div>
      </section>

      <div className="model-grid">
        <section className="model-panel">
          <h2>Firmware initialization checklist</h2>
          <div className="stage-list">
            {manual.checklist.map((section) => (
              <article key={section.section} className="stage-row">
                <div>
                  <strong>{section.section}</strong>
                  <small>{section.items.join(" ")}</small>
                  <small>{section.limitations.join(" ")}</small>
                </div>
                <span className="status-pill">{section.confidence}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="model-panel">
          <h2>Safety and fault handling notes</h2>
          <div className="stage-list">
            {manual.safetyNotes.length ? manual.safetyNotes.map((note) => (
              <article key={note.title} className="stage-row">
                <div>
                  <strong>{note.title}</strong>
                  <small>{note.note}</small>
                  <small>{note.limitation}</small>
                </div>
                <span className="status-pill">{note.confidence}</span>
              </article>
            )) : <p className="muted">No firmware safety notes generated from current evidence.</p>}
          </div>
        </section>
      </div>

      <section className="model-panel">
        <h2>Board bring-up procedure</h2>
        <div className="stage-list">
          {manual.bringUpSteps.map((step) => (
            <article key={step.order} className="stage-row">
              <div>
                <strong>{step.order}. {step.title}</strong>
                <small>{step.description}</small>
                <small>{step.limitations.join(" ")}</small>
              </div>
              <span className="status-pill">{step.confidence}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="notice-panel">
        <span className="status-pill">Missing data</span>
        <p>{manual.requiredFilesForStrongerValidation.join(", ")}</p>
      </section>
    </section>
  );
}
