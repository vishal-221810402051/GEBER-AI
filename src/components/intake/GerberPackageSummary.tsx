import type { GerberPackageRecord } from "../../features/gerber-package";
import { formatFileSize } from "../../features/intake/formatFileSize";
import { GlassAlert, LoadingDots } from "../ui";

type GerberPackageSummaryProps = Readonly<{
  packages: readonly GerberPackageRecord[];
  isExtracting: boolean;
  error: string | null;
  onRemovePackage: (packageId: string) => void;
}>;

export function GerberPackageSummary({
  packages,
  isExtracting,
  error,
  onRemovePackage
}: GerberPackageSummaryProps) {
  if (!packages.length && !isExtracting && !error) {
    return null;
  }

  return (
    <section className="gerber-package-summary" aria-label="Gerber package summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Gerber packages</span>
          <h2>Package intake</h2>
        </div>
        {isExtracting ? <LoadingDots label="Extracting Gerber package" size="sm" /> : null}
      </div>

      {error ? (
        <GlassAlert
          variant="warning"
          title="Package attention"
          message={error}
          evidence={["Choose another package", "Remove package", "Upload individual Gerber files"]}
          compact
        />
      ) : null}

      <div className="gerber-package-list">
        {packages.map((item) => (
          <details key={item.id} className="gerber-package-item">
            <summary>
              <span>
                <strong>{item.fileName}</strong>
                <small>{item.status}</small>
              </span>
              <span>{item.gerberEntryCount} Gerber</span>
              <span>{item.ignoredEntryCount} ignored</span>
              <span>{item.warningCount + item.errorCount} attention</span>
              <button
                type="button"
                className="text-action"
                onClick={(event) => {
                  event.preventDefault();
                  onRemovePackage(item.id);
                }}
              >
                Remove package
              </button>
            </summary>
            <div className="gerber-package-body">
              <div className="tag-list">
                <span>Compressed {formatFileSize(item.compressedSize)}</span>
                <span>Extracted {formatFileSize(item.extractedSize)}</span>
                <span>{item.entries.length} entrie(s)</span>
                <span>{item.diagnostics.length} diagnostic(s)</span>
              </div>
              {item.diagnostics.length ? (
                <div className="notice-panel warning compact-notice">
                  <span className="status-pill">Diagnostics</span>
                  <p>{item.diagnostics.slice(0, 3).join(" ")}</p>
                </div>
              ) : null}
              <div className="gerber-entry-list">
                {item.entries.map((entry) => (
                  <article key={entry.id} className="gerber-entry-row">
                    <div>
                      <strong>{entry.relativePath}</strong>
                      <small>{entry.classification}</small>
                      <small>{entry.diagnostic ?? "No diagnostic"}</small>
                    </div>
                    <div className="file-row-actions">
                      <span className={`status-pill status-${entry.status}`}>{entry.status}</span>
                      <span>{formatFileSize(entry.size)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
