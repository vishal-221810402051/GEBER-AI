import { Link } from "react-router-dom";
import { GlassStatusCard } from "../../components/ui";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewFirmwarePanelProps = Readonly<{
  model: ReviewWorkspaceModel;
}>;

export function ReviewFirmwarePanel({ model }: ReviewFirmwarePanelProps) {
  return (
    <section className="model-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Firmware</span>
          <h2>Firmware guidance summary</h2>
        </div>
        <Link to="/firmware" className="secondary-action">Open firmware</Link>
      </div>
      <div className="review-card-grid">
        <GlassStatusCard
          title="Guidance"
          value={model.firmware.available ? model.firmware.readiness : "limited"}
          tone={model.firmware.available ? "success" : "warning"}
        />
        <GlassStatusCard title="MCU candidates" value={model.firmware.mcuCandidates} tone="neutral" />
        <GlassStatusCard title="Pin mappings" value={model.firmware.pinMappings} tone={model.firmware.pinMappings ? "active" : "neutral"} />
        <GlassStatusCard title="Peripheral groups" value={model.firmware.peripherals} tone={model.firmware.peripherals ? "active" : "neutral"} />
      </div>
      <p className="muted">
        Firmware guidance is derived from parsed deterministic evidence and remains advisory. Datasheet pin mux,
        boot behavior, electrical limits, and firmware correctness are not validated.
      </p>
    </section>
  );
}
