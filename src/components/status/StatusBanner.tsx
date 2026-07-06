export function StatusBanner() {
  return (
    <section className="phase-banner" aria-label="Phase status">
      <strong>Phase 1 shell only.</strong>
      <span>
        Phase 4 parses KiCad PCB layout files in-browser. Schematic validation,
        electrical analysis, reporting, firmware mapping, and exports begin in
        later phases.
      </span>
    </section>
  );
}
