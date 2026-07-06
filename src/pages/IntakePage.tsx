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
    mode,
    removeFile,
    setMode,
    totalSizeBytes
  } = useFileIntake();

  const hasSchematic = completeness.categories.some(
    (category) => category.key === "kicad-schematic" && category.present
  );
  const hasPcb = completeness.categories.some(
    (category) => category.key === "kicad-pcb" && category.present
  );
  const showFirmwareWarning = firmwareWarning(mode, hasSchematic, hasPcb);

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
    </section>
  );
}
