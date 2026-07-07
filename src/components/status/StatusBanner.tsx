import { GlassAlert } from "../ui";

export function StatusBanner() {
  return (
    <GlassAlert
      variant="info"
      title="Local, evidence-based PCB review."
      message="Files stay in your browser. Findings support engineering review; they do not replace datasheets, DFM, or electrical validation."
      compact
      className="phase-banner"
    />
  );
}
