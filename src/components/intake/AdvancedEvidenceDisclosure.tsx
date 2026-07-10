const evidenceRows = [
  {
    label: ".kicad_pcb",
    detail: "Parsed native PCB source for layers, nets, pads, footprints, tracks, vias, and outline evidence."
  },
  {
    label: "BOM CSV/TSV",
    detail: "Parsed component table evidence when columns can be mapped."
  },
  {
    label: "Pick-and-place CSV/TSV",
    detail: "Parsed centroid evidence for references, side, coordinates, and rotation."
  },
  {
    label: "IPC-356",
    detail: "Detected only. Netlist content parsing is not implemented yet."
  },
  {
    label: ".kicad_pro",
    detail: "Metadata only. Project relationships are not parsed yet."
  },
  {
    label: "EasyEDA exports",
    detail: "Detected only. Import parsing is not implemented yet."
  }
];

export function AdvancedEvidenceDisclosure() {
  return (
    <details className="advanced-evidence-disclosure">
      <summary>Add advanced project evidence</summary>
      <div className="advanced-evidence-list">
        {evidenceRows.map((row) => (
          <article key={row.label}>
            <strong>{row.label}</strong>
            <span>{row.detail}</span>
          </article>
        ))}
      </div>
    </details>
  );
}
