import type { DragEvent, RefObject } from "react";
import { formatFileSize } from "../../features/intake/formatFileSize";

type UploadDropzoneProps = Readonly<{
  inputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  fileCount: number;
  totalSizeBytes: number;
  onDragStateChange: (isDragging: boolean) => void;
  onFilesSelected: (files: FileList) => void;
  onClearFiles: () => void;
}>;

const acceptedFamilies = [
  ".kicad_sch",
  "Gerber files",
  "Gerber X2 where recognized",
  ".zip Gerber package"
];

export function UploadDropzone({
  inputRef,
  isDragging,
  fileCount,
  totalSizeBytes,
  onDragStateChange,
  onFilesSelected,
  onClearFiles
}: UploadDropzoneProps) {
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onDragStateChange(false);
    onFilesSelected(event.dataTransfer.files);
  }

  return (
    <section
      className={isDragging ? "intake-upload-zone dragging" : "intake-upload-zone"}
      onDragOver={(event) => {
        event.preventDefault();
        onDragStateChange(true);
      }}
      onDragLeave={() => onDragStateChange(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".kicad_sch,.gbr,.ger,.gtl,.gbl,.gts,.gbs,.gto,.gbo,.gko,.gm1,.gml,.cmp,.sol,.zip"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
            event.target.value = "";
          }
        }}
      />
      <div>
        <span className="status-pill">Files stay local</span>
        <h2>Drop schematic and Gerber/package files</h2>
        <p>
          One shared intake reads files once, classifies them by filename and
          extension, and keeps the canonical workflow limited to schematic and
          Gerber/package evidence.
        </p>
      </div>
      <div className="upload-evidence-prompts">
        <article>
          <strong>Schematic files</strong>
          <span>
            Upload KiCad schematic files for symbols, pins, labels, nets,
            sheets, and firmware evidence.
          </span>
          <small>Primary input: .kicad_sch</small>
        </article>
        <article>
          <strong>Gerber/package files</strong>
          <span>
            Upload individual Gerber files or a ZIP containing Gerber layers.
            Package contents are extracted and classified locally in your browser.
          </span>
          <small>Gerber files or package. Geometry analysis begins in the next Gerber parser phase.</small>
        </article>
      </div>
      <div className="hero-actions">
        <button
          type="button"
          className="primary-action"
          onClick={() => inputRef.current?.click()}
        >
          Select files
        </button>
        <button
          type="button"
          className="secondary-action"
          onClick={onClearFiles}
          disabled={fileCount === 0}
        >
          Clear all
        </button>
      </div>
      <div className="intake-upload-meta">
        <span>{fileCount} file(s)</span>
        <span>{formatFileSize(totalSizeBytes)}</span>
      </div>
      <div className="capability-strip compact" aria-label="Accepted file families">
        {acceptedFamilies.map((family) => (
          <span key={family}>{family}</span>
        ))}
      </div>
    </section>
  );
}
