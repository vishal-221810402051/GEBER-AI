import { useRef, useState, type DragEvent } from "react";
import { formatFileSize } from "../features/intake/formatFileSize";
import { useFileIntake } from "../features/intake/useFileIntake";
import type { AnalysisMode } from "../features/intake/intakeTypes";
import { PageHeader } from "./shared/PageHeader";

const fileTypes = [
  ".kicad_sch",
  ".kicad_pcb",
  ".kicad_pro",
  "Gerber RS-274X / Gerber X2",
  "Excellon drill files",
  "IPC-356 netlist",
  "BOM CSV/XLSX",
  "Pick-and-place / centroid files",
  "EasyEDA exports where technically supportable",
  "ZIP archives classified as archives only"
];

const modeDetails: Record<
  AnalysisMode,
  {
    title: string;
    description: string;
    recommended: readonly string[];
  }
> = {
  basic: {
    title: "Basic Mode",
    description:
      "Manufacturing-package review planning. No PCB content analysis runs in Phase 2.",
    recommended: ["Gerbers", "Drill file", "BOM if available"]
  },
  analyze: {
    title: "Analyze Mode",
    description:
      "Future deeper engineering review requiring schematic, PCB, manufacturing, and assembly evidence.",
    recommended: [
      ".kicad_pcb",
      ".kicad_sch",
      "BOM",
      "Pick-and-place",
      "Drill",
      "Gerbers",
      "IPC-356 if available"
    ]
  },
  firmware: {
    title: "Firmware Mode",
    description:
      "Future firmware documentation mode. Pin mapping is not trustworthy without schematic and PCB net data.",
    recommended: [".kicad_sch", ".kicad_pcb", "BOM if available"]
  }
};

function firmwareWarning(mode: AnalysisMode, hasSchematic: boolean, hasPcb: boolean): boolean {
  return mode === "firmware" && (!hasSchematic || !hasPcb);
}

export function IntakePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    addFiles,
    clearFiles,
    completeness,
    files,
    bomResults,
    kicadPcbResults,
    kicadSchematicResults,
    mode,
    normalizedProject,
    removeFile,
    setMode,
    totalSizeBytes,
    placementResults
  } = useFileIntake();

  const hasSchematic = completeness.categories.some(
    (category) => category.key === "kicad-schematic" && category.present
  );
  const hasPcb = completeness.categories.some(
    (category) => category.key === "kicad-pcb" && category.present
  );
  const showFirmwareWarning = firmwareWarning(mode, hasSchematic, hasPcb);
  const activeKicadPcbResult = Object.values(kicadPcbResults)[0];
  const activeSchematicResult = Object.values(kicadSchematicResults)[0];
  const activeBomResult = Object.values(bomResults)[0];
  const activePlacementResult = Object.values(placementResults)[0];

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Phase 2 intake"
        title="Upload and classify project files by metadata"
        description="Select multiple files for local browser-only intake. Phase 2 reads file name, size, extension, and MIME metadata only; content parsing begins in later phases."
      />

      <div className="notice-panel strong">
        <span className="status-pill">Phase 2 only</span>
        <p>
          Metadata classification complete after selection. No KiCad, EasyEDA,
          Gerber, Excellon, BOM, placement, netlist, firmware, or report parser
          validates file contents yet.
        </p>
      </div>

      <div
        className={isDragging ? "drop-zone dragging" : "drop-zone"}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <span className="status-pill">Metadata only</span>
        <h2>Drop project files here</h2>
        <p>
          Multi-file intake is local to this browser session. Files are not sent
          to a backend and are not parsed for PCB contents in Phase 2.
        </p>
        <button
          type="button"
          className="secondary-action"
          onClick={() => inputRef.current?.click()}
        >
          Select files
        </button>
      </div>

      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Intake summary</span>
          <div className="metric-row">
            <strong>{files.length}</strong>
            <span>Uploaded files</span>
          </div>
          <div className="metric-row">
            <strong>{formatFileSize(totalSizeBytes)}</strong>
            <span>Total upload size</span>
          </div>
          <div className="score-meter" aria-label="File completeness score">
            <div style={{ width: `${completeness.score}%` }} />
          </div>
          <div className="metric-row">
            <strong>{completeness.score}/100</strong>
            <span>{completeness.readinessLabel}</span>
          </div>
          <p className="muted">
            Parser status: Classification complete. Content parsing begins in
            later phases.
          </p>
        </section>

        <section className="summary-panel">
          <span className="eyebrow">Detected categories</span>
          {completeness.detectedCategories.length > 0 ? (
            <div className="tag-list">
              {completeness.detectedCategories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          ) : (
            <p className="muted">No project package uploaded yet.</p>
          )}
        </section>

        <section className="summary-panel">
          <span className="eyebrow">Missing recommended files</span>
          <div className="checklist">
            {completeness.missingCategories.map((category) => (
              <div key={category.key} className="check-row missing">
                <span>{category.label}</span>
                <small>{category.whyItMatters}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      {completeness.gerberOnlyLimitation ? (
        <div className="notice-panel warning">
          <span className="status-pill">Gerber-only limitation</span>
          <p>
            Gerber and drill packages can support manufacturing review, but
            they cannot reconstruct full schematic intent, component semantics,
            BOM authority, or trusted firmware pin purpose.
          </p>
        </div>
      ) : null}

      {showFirmwareWarning ? (
        <div className="notice-panel warning">
          <span className="status-pill">Firmware warning</span>
          <p>
            Firmware pin mapping cannot be trusted without schematic and PCB net
            data.
          </p>
        </div>
      ) : null}

      {activeKicadPcbResult ? (
        <section className="page-stack">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KiCad PCB parser result</span>
              <h2>Parsed board layout summary</h2>
            </div>
            <span className="status-pill">
              {activeKicadPcbResult.success ? "parsed" : "failed"}
            </span>
          </div>
          <div className="notice-panel">
            <span className="status-pill">Layout parsed from .kicad_pcb</span>
            <p>
              Schematic validation begins in Phase 5. No electrical analysis,
              BOM validation, firmware mapping, or manufacturing validity check
              has been performed.
            </p>
          </div>
          <div className="summary-grid">
            <section className="summary-panel">
              <span className="eyebrow">Counts</span>
              <div className="tag-list">
                <span>Layers: {activeKicadPcbResult.summary.layerCount}</span>
                <span>Nets: {activeKicadPcbResult.summary.netCount}</span>
                <span>Footprints: {activeKicadPcbResult.summary.footprintCount}</span>
                <span>Pads: {activeKicadPcbResult.summary.padCount}</span>
                <span>Tracks: {activeKicadPcbResult.summary.trackSegmentCount}</span>
                <span>Vias: {activeKicadPcbResult.summary.viaCount}</span>
                <span>Zones: {activeKicadPcbResult.summary.zoneCount}</span>
              </div>
            </section>
            <section className="summary-panel">
              <span className="eyebrow">Outline</span>
              <p>Status: {activeKicadPcbResult.summary.outlineStatus}</p>
              <p>
                Edge.Cuts primitives:{" "}
                {activeKicadPcbResult.summary.edgeCutsPrimitiveCount}
              </p>
            </section>
            <section className="summary-panel">
              <span className="eyebrow">Parser diagnostics</span>
              <p>
                {activeKicadPcbResult.diagnostics.length} diagnostic
                item(s)
              </p>
            </section>
          </div>
        </section>
      ) : null}

      {activeSchematicResult ? (
        <section className="page-stack">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KiCad schematic parser result</span>
              <h2>Parsed schematic summary</h2>
            </div>
            <span className="status-pill">
              {activeSchematicResult.success ? "parsed" : "failed"}
            </span>
          </div>
          <div className="notice-panel">
            <span className="status-pill">Schematic parsed from .kicad_sch</span>
            <p>
              PCB comparison is not implemented yet. No electrical analysis,
              firmware mapping, BOM validation, or schematic-to-layout matching
              has been performed.
            </p>
          </div>
          <div className="summary-grid">
            <section className="summary-panel">
              <span className="eyebrow">Schematic counts</span>
              <div className="tag-list">
                <span>Symbols: {activeSchematicResult.summary.symbolInstanceCount}</span>
                <span>Library symbols: {activeSchematicResult.summary.librarySymbolCount}</span>
                <span>Labels: {activeSchematicResult.summary.labelCount}</span>
                <span>Wires: {activeSchematicResult.summary.wireCount}</span>
                <span>Junctions: {activeSchematicResult.summary.junctionCount}</span>
                <span>No-connects: {activeSchematicResult.summary.noConnectCount}</span>
                <span>Sheets: {activeSchematicResult.summary.sheetCount}</span>
              </div>
            </section>
            <section className="summary-panel">
              <span className="eyebrow">Footprint properties</span>
              <p>With footprint: {activeSchematicResult.summary.symbolsWithFootprint}</p>
              <p>Missing footprint: {activeSchematicResult.summary.symbolsMissingFootprint}</p>
            </section>
            <section className="summary-panel">
              <span className="eyebrow">Parser diagnostics</span>
              <p>{activeSchematicResult.diagnostics.length} diagnostic item(s)</p>
            </section>
          </div>
        </section>
      ) : null}

      {activeBomResult || activePlacementResult ? (
        <section className="page-stack">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Phase 6 table parsers</span>
              <h2>BOM and placement table summaries</h2>
            </div>
            <span className="status-pill">Not PCB-validated yet</span>
          </div>
          <div className="notice-panel">
            <span className="status-pill">Table-level only</span>
            <p>BOM and placement files are parsed as tables only; PCB validation is not implemented yet.</p>
          </div>
          <div className="summary-grid">
            {activeBomResult ? (
              <section className="summary-panel">
                <span className="eyebrow">BOM parser</span>
                <div className="tag-list">
                  <span>Status: {activeBomResult.unsupported ? "unsupported" : activeBomResult.success ? "parsed" : "failed"}</span>
                  <span>Rows: {activeBomResult.summary.rowCount}</span>
                  <span>Refs: {activeBomResult.summary.parsedReferenceCount}</span>
                  <span>Diagnostics: {activeBomResult.diagnostics.length}</span>
                </div>
              </section>
            ) : null}
            {activePlacementResult ? (
              <section className="summary-panel">
                <span className="eyebrow">Placement parser</span>
                <div className="tag-list">
                  <span>Status: {activePlacementResult.success ? "parsed" : "failed"}</span>
                  <span>Rows: {activePlacementResult.summary.rowCount}</span>
                  <span>Top: {activePlacementResult.summary.topSideCount}</span>
                  <span>Bottom: {activePlacementResult.summary.bottomSideCount}</span>
                  <span>Unknown: {activePlacementResult.summary.unknownSideCount}</span>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="summary-panel">
        <span className="eyebrow">Phase 7 net inventory</span>
        <div className="tag-list">
          <span>
            Inventory: {normalizedProject.netInventory.available ? "available" : "unavailable"}
          </span>
          <span>Nets: {normalizedProject.netInventory.summary.totalNets}</span>
          <span>Classified: {normalizedProject.netInventory.summary.classifiedNets}</span>
          <span>Unknown: {normalizedProject.netInventory.summary.unknownNets}</span>
        </div>
        <p className="muted">
          Phase 7 classification is deterministic and name-based. Electrical
          validation is not implemented.
        </p>
      </section>

      <section className="summary-panel">
        <span className="eyebrow">Phase 8 analysis status</span>
        <div className="tag-list">
          <span>Decoupling: {normalizedProject.analysis.decoupling.available ? "available" : "missing data"}</span>
          <span>Pull resistors: {normalizedProject.analysis.pullResistors.available ? "available" : "missing data"}</span>
          <span>ICs reviewed: {normalizedProject.analysis.summary.icCountReviewed}</span>
          <span>Pull candidates: {normalizedProject.analysis.summary.pullUpCandidates + normalizedProject.analysis.summary.pullDownCandidates}</span>
          <span>Bias warnings: {normalizedProject.analysis.summary.biasWarnings}</span>
        </div>
        <p className="muted">
          Required for stronger confidence:{" "}
          {Array.from(
            new Set([
              ...normalizedProject.analysis.decoupling.requiredFilesForStrongerValidation,
              ...normalizedProject.analysis.pullResistors.requiredFilesForStrongerValidation
            ])
          ).join(", ")}
        </p>
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Analysis mode selection</span>
            <h2>Choose a future workflow mode</h2>
          </div>
          <span className="status-pill">No analysis runs</span>
        </div>
        <div className="mode-grid">
          {(Object.keys(modeDetails) as AnalysisMode[]).map((modeKey) => {
            const detail = modeDetails[modeKey];
            return (
              <button
                key={modeKey}
                type="button"
                className={mode === modeKey ? "mode-card active" : "mode-card"}
                onClick={() => setMode(modeKey)}
              >
                <span className="status-pill">
                  {mode === modeKey ? "Selected" : "Planned"}
                </span>
                <h3>{detail.title}</h3>
                <p>{detail.description}</p>
                <small>Recommended: {detail.recommended.join(", ")}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Uploaded files</span>
            <h2>Selected file list</h2>
          </div>
          <button
            type="button"
            className="secondary-action compact"
            onClick={clearFiles}
            disabled={files.length === 0}
          >
            Clear all files
          </button>
        </div>

        {files.length > 0 ? (
          <div className="file-table">
            <div className="file-table-header">
              <span>File</span>
              <span>Detected file type</span>
              <span>Classification confidence</span>
              <span>Completeness contribution</span>
              <span>Required for deeper analysis</span>
              <span />
            </div>
            {files.map((file) => (
              <div key={file.id} className="file-row">
                <div>
                  <strong>{file.name}</strong>
                  <small>
                    {formatFileSize(file.sizeBytes)} | {file.extension} | MIME:{" "}
                    {file.mimeType}
                  </small>
                </div>
                <span>{file.categoryLabel}</span>
                <span className="status-pill">{file.confidence}</span>
                <span>{file.completenessContribution}</span>
                <span>Parser not implemented</span>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => removeFile(file.id)}
                >
                  Remove
                </button>
                <p className="file-note">{file.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="status-pill">No files selected</span>
            <p>
              Add design files to calculate metadata-only completeness and
              category readiness.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2>Accepted and Planned File Type Information</h2>
        <div className="tag-list">
          {fileTypes.map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Normalized project preview</span>
            <h2>Metadata-level project model</h2>
          </div>
          <span className="status-pill">Parser not implemented</span>
        </div>

        <div className="notice-panel">
          <span className="status-pill">Heuristic analysis</span>
          <p>
            Phase 8 adds evidence-based decoupling and pull-up/pull-down
            heuristics when parsed pad-net data exists. Full electrical
            validation, power tree analysis, firmware mapping, and reports are
            not implemented.
          </p>
        </div>

        <div className="summary-grid">
          <section className="summary-panel">
            <span className="eyebrow">Project</span>
            <div className="metric-row">
              <strong>{normalizedProject.name}</strong>
              <span>{normalizedProject.selectedMode}</span>
            </div>
            <p className="muted">Project ID: {normalizedProject.id}</p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Parser status summary</span>
            <div className="metric-row">
              <strong>
                {
                  normalizedProject.parserResult.stages.filter(
                    (stage) => stage.status === "metadata-classified"
                  ).length
                }
              </strong>
              <span>metadata stage complete</span>
            </div>
            <p className="muted">
              All parser stages beyond file classification are future parser
              stages.
            </p>
          </section>
          <section className="summary-panel">
            <span className="eyebrow">Evidence summary</span>
            <div className="metric-row">
              <strong>{normalizedProject.directEvidence.length}</strong>
              <span>direct evidence items</span>
            </div>
            <div className="metric-row">
              <strong>{normalizedProject.inferredEvidence.length}</strong>
              <span>low-confidence inference items</span>
            </div>
          </section>
        </div>

        <div className="model-grid">
          <section className="model-panel">
            <h3>Parser stages</h3>
            <div className="stage-list">
              {normalizedProject.parserResult.stages.map((stage) => (
                <article key={stage.id} className="stage-row">
                  <div>
                    <strong>{stage.label}</strong>
                    <small>{stage.message}</small>
                  </div>
                  <span className="status-pill">{stage.status}</span>
                  <small>{stage.requiredFuturePhase}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="model-panel">
            <h3>Missing-data warnings</h3>
            <div className="stage-list">
              {normalizedProject.missingDataWarnings.map((warning) => (
                <article key={warning.id} className="stage-row">
                  <div>
                    <strong>{warning.title}</strong>
                    <small>{warning.message}</small>
                    <small>{warning.whyItMatters}</small>
                  </div>
                  <span className="status-pill">{warning.severity}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="model-grid">
          <section className="model-panel">
            <h3>Direct evidence</h3>
            <div className="stage-list">
              {normalizedProject.directEvidence.length > 0 ? (
                normalizedProject.directEvidence.map((evidence) => (
                  <article key={evidence.id} className="stage-row">
                    <div>
                      <strong>{evidence.title}</strong>
                      <small>{evidence.message}</small>
                    </div>
                    <span className="status-pill">{evidence.confidence}</span>
                  </article>
                ))
              ) : (
                <p className="muted">No direct file evidence yet.</p>
              )}
            </div>
          </section>

          <section className="model-panel">
            <h3>Assumptions</h3>
            <div className="stage-list">
              {normalizedProject.assumptions.map((assumption) => (
                <article key={assumption.id} className="stage-row">
                  <div>
                    <strong>{assumption.title}</strong>
                    <small>{assumption.message}</small>
                  </div>
                  <span className="status-pill">{assumption.confidence}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
