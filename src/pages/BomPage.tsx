import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useFileIntake } from "../features/intake/useFileIntake";
import { buildBomExport } from "../features/export/buildBomExport";
import { tableToCsv } from "../features/export/csv";
import { downloadTextFile } from "../features/export/downloadFile";
import { toPrettyJson } from "../features/export/json";
import { PageHeader } from "./shared/PageHeader";

export function BomPage() {
  const { normalizedProject } = useFileIntake();
  const bom = normalizedProject.bom.bom;

  if (!bom) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="BOM"
          title="Requires BOM file"
          description="Upload a BOM CSV/TSV from Intake. Spreadsheet files are recognized but not parsed in Phase 6."
        />
        <div className="empty-state">
          <span className="status-pill">No BOM parsed</span>
          <p>Requires BOM file. Upload a BOM CSV/TSV from Intake.</p>
          <Link to="/intake" className="primary-action">
            Open Intake
          </Link>
        </div>
      </section>
    );
  }

  if (bom.unsupported) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="BOM"
          title="Spreadsheet parsing not implemented"
          description="Spreadsheet file recognized, but spreadsheet parsing is not implemented in Phase 6."
        />
        <div className="notice-panel warning">
          <span className="status-pill">Unsupported in Phase 6</span>
          <p>{bom.diagnostics.map((item) => item.message).join(" ")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="BOM"
        title="BOM rows parsed from table"
        description="BOM table-level data only. BOM-to-PCB validation is not implemented yet."
      />
      <div className="notice-panel">
        <span className="status-pill">Not compared yet</span>
        <p>No component validation, footprint matching, assembly validation, or manufacturing package validation has been performed.</p>
      </div>
      <div className="notice-panel">
        <span className="status-pill">Exports</span>
        <div className="hero-actions">
          <button type="button" className="secondary-action" onClick={() => downloadTextFile("geberai-bom.csv", tableToCsv(buildBomExport(bom)), "text/csv")}>
            Export BOM CSV
          </button>
          <button type="button" className="secondary-action" onClick={() => downloadTextFile("geberai-bom.json", toPrettyJson(bom), "application/json")}>
            Export BOM JSON
          </button>
        </div>
      </div>
      <div className="summary-grid">
        <section className="summary-panel">
          <span className="eyebrow">Rows</span>
          <div className="metric-row">
            <strong>{bom.summary.rowCount}</strong>
            <span>BOM rows</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">References</span>
          <div className="metric-row">
            <strong>{bom.summary.parsedReferenceCount}</strong>
            <span>parsed references</span>
          </div>
        </section>
        <section className="summary-panel">
          <span className="eyebrow">Diagnostics</span>
          <div className="metric-row">
            <strong>{bom.diagnostics.length}</strong>
            <span>items</span>
          </div>
        </section>
      </div>
      <div className="data-table bom-table">
        <span>Refs</span>
        <span>Qty</span>
        <span>Value</span>
        <span>Footprint/package</span>
        <span>Description</span>
        <span>MPN</span>
        <span>Supplier PN</span>
        <span>Supplier</span>
        <span>Tolerance</span>
        <span>Voltage</span>
        <span>Current</span>
        <span>Notes</span>
        {bom.rows.map((row) => (
          <Fragment key={row.rowIndex}>
            <span>{row.referenceDesignatorsRaw ?? "Unavailable"}</span>
            <span>{row.quantity ?? "Unavailable"}</span>
            <span>{row.value ?? "Unavailable"}</span>
            <span>{row.footprint ?? "Unavailable"}</span>
            <span>{row.description ?? "Unavailable"}</span>
            <span>{row.manufacturerPartNumber ?? "Unavailable"}</span>
            <span>{row.supplierPartNumber ?? "Unavailable"}</span>
            <span>{row.supplier ?? "Unavailable"}</span>
            <span>{row.tolerance ?? "Unavailable"}</span>
            <span>{row.voltageRating ?? "Unavailable"}</span>
            <span>{row.currentRating ?? "Unavailable"}</span>
            <span>{row.notes ?? "Unavailable"}</span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
