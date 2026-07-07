import { formatFileSize } from "../../features/intake/formatFileSize";
import type { IntakeDisplayFile } from "../../features/intake/intakeDisplayTypes";
import type { KiCadSchematicParseResult } from "../../features/parsers/kicad-schematic/kicadSchematicTypes";

type SchematicFileCardProps = Readonly<{
  item: IntakeDisplayFile;
  onRemove: (id: string) => void;
}>;

function schematicResult(item: IntakeDisplayFile): KiCadSchematicParseResult | undefined {
  const result = item.parserResult;
  return result && "sheets" in result ? result : undefined;
}

export function SchematicFileCard({ item, onRemove }: SchematicFileCardProps) {
  const result = schematicResult(item);
  const title = result?.metadata.titleBlock?.title ?? "Title unavailable";
  const firstSheet = result?.sheets[0];

  return (
    <article className="schematic-file-card">
      <div className="file-row-main">
        <div>
          <span className="eyebrow">Schematic file</span>
          <strong>{item.file.name}</strong>
          <small>{formatFileSize(item.file.sizeBytes)} | Parsed independently | Not PCB-compared</small>
        </div>
        <div className="file-row-actions">
          <span className={`status-pill status-${item.status}`}>{item.statusLabel}</span>
          <button type="button" className="text-action" onClick={() => onRemove(item.file.id)}>
            Remove
          </button>
        </div>
      </div>
      <div className="tag-list">
        <span>{title}</span>
        <span>Sheet: {firstSheet?.name ?? "Sheet evidence unavailable"}</span>
        <span>UUID: {result?.metadata.uuid ?? firstSheet?.uuid ?? "Unavailable"}</span>
        <span>Hierarchy role unavailable</span>
      </div>
      <div className="intake-micro-grid">
        <span>Symbols <strong>{result?.summary.symbolInstanceCount ?? 0}</strong></span>
        <span>Lib symbols <strong>{result?.summary.librarySymbolCount ?? 0}</strong></span>
        <span>Labels <strong>{result?.summary.labelCount ?? 0}</strong></span>
        <span>Global <strong>{result?.summary.globalLabelCount ?? 0}</strong></span>
        <span>Hierarchical <strong>{result?.summary.hierarchicalLabelCount ?? 0}</strong></span>
        <span>Wires <strong>{result?.summary.wireCount ?? 0}</strong></span>
        <span>Junctions <strong>{result?.summary.junctionCount ?? 0}</strong></span>
        <span>No-connect <strong>{result?.summary.noConnectCount ?? 0}</strong></span>
        <span>Sheets <strong>{result?.summary.sheetCount ?? 0}</strong></span>
        <span>Diagnostics <strong>{item.diagnostics.length}</strong></span>
      </div>
      {item.diagnostics.length ? (
        <details>
          <summary>Diagnostics</summary>
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
