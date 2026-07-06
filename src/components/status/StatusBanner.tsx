export function StatusBanner() {
  return (
    <section className="phase-banner" aria-label="Phase status">
      <strong>Phase 1 shell only.</strong>
      <span>
        Phase 6 parses BOM and pick-and-place tables in-browser. Table data is
        not PCB-validated; analysis, firmware mapping, and exports begin in
        later phases.
      </span>
    </section>
  );
}
