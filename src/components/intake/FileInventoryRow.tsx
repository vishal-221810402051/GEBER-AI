import { formatFileSize } from "../../features/intake/formatFileSize";
import type { IntakeDisplayFile } from "../../features/intake/intakeDisplayTypes";

type FileInventoryRowProps = Readonly<{
  item: IntakeDisplayFile;
  onRemove: (id: string) => void;
}>;

export function FileInventoryRow({ item, onRemove }: FileInventoryRowProps) {
  return (
    <article className="inventory-file-row">
      <div className="file-row-main">
        <div>
          <strong>{item.file.name}</strong>
          <small>
            {formatFileSize(item.file.sizeBytes)} | {item.file.categoryLabel} | {item.file.confidence}
          </small>
        </div>
        <div className="file-row-actions">
          <span className={`status-pill status-${item.status}`}>{item.statusLabel}</span>
          <button type="button" className="text-action" onClick={() => onRemove(item.file.id)}>
            Remove
          </button>
        </div>
      </div>
      <div className="tag-list">
        {item.summaryItems.map((summary) => (
          <span key={summary}>{summary}</span>
        ))}
      </div>
      {item.diagnostics.length ? (
        <details>
          <summary>{item.diagnostics.length} diagnostic item(s)</summary>
          <div className="stage-list">
            {item.diagnostics.map((diagnostic, index) => (
              <article key={`${diagnostic.message}-${index}`} className="stage-row">
                <div>
                  <strong>{diagnostic.severity ?? "info"}</strong>
                  <small>{diagnostic.message}</small>
                </div>
                {diagnostic.confidence ? <span className="status-pill">{diagnostic.confidence}</span> : null}
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}
