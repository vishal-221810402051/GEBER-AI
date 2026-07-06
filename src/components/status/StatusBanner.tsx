export function StatusBanner() {
  return (
    <section className="phase-banner" aria-label="Phase status">
      <strong>Phase 1 shell only.</strong>
      <span>
        Phase 5 parses KiCad schematic files in-browser. PCB comparison,
        electrical analysis, reporting, firmware mapping, and exports begin in
        later phases.
      </span>
    </section>
  );
}
