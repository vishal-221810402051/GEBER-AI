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
  "KiCad schematic",
  "KiCad PCB",
  "BOM",
  "Placement",
  "Drill",
  "Gerber",
  "IPC/netlist",
  "EasyEDA/archive",
  "Unknown"
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
        <h2>Drop KiCad, BOM, placement, drill, Gerber, or netlist files</h2>
        <p>
          Evidence-based parsing and analysis run in this browser session.
        </p>
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
