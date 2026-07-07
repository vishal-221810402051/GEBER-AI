import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFileIntake } from "../features/intake/useFileIntake";
import type { NormalizedNetSource } from "../domain";
import { buildNetExport } from "../features/export/buildNetExport";
import { tableToCsv } from "../features/export/csv";
import { downloadTextFile } from "../features/export/downloadFile";
import { toPrettyJson } from "../features/export/json";
import { PageHeader } from "./shared/PageHeader";

export function NetsPage() {
  const { normalizedProject } = useFileIntake();
  const inventory = normalizedProject.netInventory;
  const pullAnalysis = normalizedProject.analysis.pullResistors;
  const firmware = normalizedProject.firmware.manual;
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("all");
  const [source, setSource] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [expandedNetId, setExpandedNetId] = useState<string | null>(null);

  const classifications = Array.from(
    new Set(inventory.nets.map((net) => net.classification))
  ).sort();
  const sources = Array.from(new Set(inventory.nets.flatMap((net) => net.sources))).sort();
  const confidences = Array.from(
    new Set(inventory.nets.map((net) => net.classificationConfidence))
  ).sort();

  const filteredNets = useMemo(
    () =>
      inventory.nets.filter((net) => {
        const matchesSearch = net.name.toLowerCase().includes(search.toLowerCase());
        const matchesClassification =
          classification === "all" || net.classification === classification;
        const matchesSource = source === "all" || net.sources.includes(source as NormalizedNetSource);
        const matchesConfidence =
          confidence === "all" || net.classificationConfidence === confidence;
        return matchesSearch && matchesClassification && matchesSource && matchesConfidence;
      }),
    [classification, confidence, inventory.nets, search, source]
  );

  if (!inventory.available) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Net explorer"
          title="Requires KiCad PCB or schematic files"
          description="Upload `.kicad_pcb` and/or `.kicad_sch` files from Intake to build a normalized net inventory."
        />
        <div className="empty-state">
          <span className="status-pill">No net inventory</span>
          <p>Requires KiCad PCB or schematic files.</p>
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
        eyebrow="Phase 7 net explorer"
        title="Normalized net inventory"
        description="Net inventory built from parsed PCB and schematic metadata. Classification is deterministic and name-based."
      />
      <div className="notice-panel">
        <span className="status-pill">Not electrical validation</span>
        <p>
          Cross-source observations are informational only. Full schematic-to-PCB
          validation and electrical validation are not implemented yet.
        </p>
      </div>
      <div className="notice-panel">
        <span className="status-pill">Exports</span>
        <div className="hero-actions">
          <button type="button" className="secondary-action" onClick={() => downloadTextFile("geberai-net-inventory.csv", tableToCsv(buildNetExport(inventory)), "text/csv")}>
            Export Net CSV
          </button>
          <button type="button" className="secondary-action" onClick={() => downloadTextFile("geberai-net-inventory.json", toPrettyJson(inventory), "application/json")}>
            Export Net JSON
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Inventory</span>
          <div className="tag-list">
            <span>Total: {inventory.summary.totalNets}</span>
            <span>Classified: {inventory.summary.classifiedNets}</span>
            <span>Unknown: {inventory.summary.unknownNets}</span>
            <span>Diagnostics: {inventory.summary.diagnosticsCount + inventory.diagnostics.length}</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Classification distribution</span>
          <div className="tag-list">
            {Object.entries(inventory.summary.classificationDistribution).map(([key, value]) => (
              <span key={key}>{key}: {value}</span>
            ))}
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Source distribution</span>
          <div className="tag-list">
            {Object.entries(inventory.summary.sourceDistribution).map(([key, value]) => (
              <span key={key}>{key}: {value}</span>
            ))}
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Phase 8 bias evidence</span>
          <div className="tag-list">
            <span>Pull-ups: {pullAnalysis.candidates.filter((candidate) => candidate.biasType === "pull-up").length}</span>
            <span>Pull-downs: {pullAnalysis.candidates.filter((candidate) => candidate.biasType === "pull-down").length}</span>
            <span>Bias requirements: {pullAnalysis.requirements.length}</span>
            <span>Missing evidence: {pullAnalysis.findings.filter((finding) => finding.type === "bias-missing-evidence").length}</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Phase 10 firmware notes</span>
          <div className="tag-list">
            <span>Pin-map nets: {new Set(firmware?.pinMap.map((entry) => entry.netName).filter(Boolean)).size}</span>
            <span>Peripheral groups: {firmware?.peripherals.length ?? 0}</span>
            <span>Safety notes: {firmware?.safetyNotes.length ?? 0}</span>
          </div>
        </section>
      </div>

      <div className="filter-bar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search nets"
          aria-label="Search nets"
        />
        <select value={classification} onChange={(event) => setClassification(event.target.value)}>
          <option value="all">All classifications</option>
          {classifications.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="all">All sources</option>
          {sources.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={confidence} onChange={(event) => setConfidence(event.target.value)}>
          <option value="all">All confidence</option>
          {confidences.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="data-table net-inventory-table">
        <span>Net name</span>
        <span>Classification</span>
        <span>Confidence</span>
        <span>Source</span>
        <span>PCB pads</span>
        <span>Segments</span>
        <span>Vias</span>
        <span>Zones</span>
        <span>Labels</span>
        <span>Evidence</span>
        <span>Diagnostics</span>
        {filteredNets.map((net) => (
          <button
            key={net.id}
            type="button"
            className="net-row"
            onClick={() => setExpandedNetId(expandedNetId === net.id ? null : net.id)}
          >
            <span>{net.name}</span>
            <span>{net.classification}</span>
            <span>{net.classificationConfidence}</span>
            <span>{net.sources.join(", ")}</span>
            <span>{net.connectedPcbPads.length}</span>
            <span>{net.pcbSegmentCount}</span>
            <span>{net.pcbViaCount}</span>
            <span>{net.pcbZoneCount}</span>
            <span>{net.schematicLabelCount}</span>
            <span>{net.evidence.length}</span>
            <span>{net.diagnostics.length}</span>
          </button>
        ))}
      </div>

      {filteredNets
        .filter((net) => net.id === expandedNetId)
        .map((net) => (
          <section key={net.id} className="model-panel">
            {(() => {
              const pulls = pullAnalysis.candidates.filter((candidate) => candidate.signalNet.toUpperCase() === net.name.toUpperCase());
              const requirement = pullAnalysis.requirements.find((item) => item.netName.toUpperCase() === net.name.toUpperCase());
              const firmwarePins = firmware?.pinMap.filter((entry) => entry.netName?.toUpperCase() === net.name.toUpperCase()) ?? [];
              const firmwarePeripheral = firmware?.peripherals.find((peripheral) => peripheral.nets.some((item) => item.toUpperCase() === net.name.toUpperCase()));
              return (
                <>
            <h2>{net.name}</h2>
            <div className="summary-grid">
              <section className="summary-panel">
                <span className="eyebrow">Classification reasoning</span>
                <p>{net.classificationEvidence}</p>
                <p className="muted">{net.classificationReason}</p>
              </section>
              <section className="summary-panel">
                <span className="eyebrow">Connected PCB references</span>
                <p>Footprints: {net.connectedPcbFootprints.join(", ") || "Unavailable"}</p>
                <p>Pads: {net.connectedPcbPads.join(", ") || "Unavailable"}</p>
              </section>
              <section className="summary-panel">
                <span className="eyebrow">Related schematic labels</span>
                <p>{net.relatedSchematicLabels.join(", ") || "Unavailable"}</p>
              </section>
              <section className="summary-panel">
                <span className="eyebrow">Phase 8 pull evidence</span>
                <p>
                  {pulls.length
                    ? pulls.map((pull) => `${pull.reference} ${pull.biasType} via ${pull.biasNet}`).join(", ")
                    : "No pull-up or pull-down candidate attached to this net."}
                </p>
                <p className="muted">
                  Bias status: {requirement?.status ?? "No heuristic bias requirement"}
                </p>
              </section>
              <section className="summary-panel">
                <span className="eyebrow">Phase 10 firmware use</span>
                <p>
                  {firmwarePins.length
                    ? firmwarePins.map((pin) => `${pin.mcuReference}:${pin.physicalPin} ${pin.direction}`).join(", ")
                    : "No firmware pin-map entry for this net."}
                </p>
                <p className="muted">
                  Peripheral: {firmwarePeripheral?.peripheralType ?? "none"} {net.classification === "Reset" || net.classification === "Boot/strap" ? "Boot/reset safety review required." : ""}
                </p>
              </section>
            </div>
            <div className="model-grid">
              <section>
                <h3>Evidence</h3>
                <div className="stage-list">
                  {net.evidence.map((item, index) => (
                    <article key={`${net.id}-evidence-${index}`} className="stage-row">
                      <small>{item}</small>
                    </article>
                  ))}
                </div>
              </section>
              <section>
                <h3>Diagnostics</h3>
                <div className="stage-list">
                  {net.diagnostics.length ? net.diagnostics.map((diagnostic) => (
                    <article key={diagnostic.id} className="stage-row">
                      <div>
                        <strong>{diagnostic.severity}</strong>
                        <small>{diagnostic.message}</small>
                      </div>
                      <span className="status-pill">{diagnostic.confidence}</span>
                    </article>
                  )) : <p className="muted">No net diagnostics.</p>}
                </div>
              </section>
            </div>
            <div className="notice-panel">
              <span className="status-pill">Limitations</span>
              <p>
                {net.limitations.join(" ")} {requirement?.limitations.join(" ") ?? ""}
              </p>
            </div>
                </>
              );
            })()}
          </section>
        ))}
    </section>
  );
}
