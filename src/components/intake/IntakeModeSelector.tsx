import type { AnalysisMode } from "../../features/intake/intakeTypes";

type IntakeModeSelectorProps = Readonly<{
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
  showFirmwareWarning: boolean;
}>;

const modeDetails: Record<
  AnalysisMode,
  { label: string; short: string; requirements: readonly string[] }
> = {
  basic: {
    label: "Basic",
    short: "Manufacturing package review.",
    requirements: ["Gerbers", "Drill", "BOM if available"]
  },
  analyze: {
    label: "Analyze",
    short: "Broader board evidence review.",
    requirements: [".kicad_pcb", ".kicad_sch", "BOM", "Placement"]
  },
  firmware: {
    label: "Firmware",
    short: "Pin-map and bring-up guidance.",
    requirements: [".kicad_sch", ".kicad_pcb", "Datasheet review"]
  }
};

export function IntakeModeSelector({ mode, setMode, showFirmwareWarning }: IntakeModeSelectorProps) {
  return (
    <section className="intake-module">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Workflow mode</span>
          <h2>Choose review intent</h2>
        </div>
        {showFirmwareWarning ? (
          <span className="status-pill">Firmware evidence limited</span>
        ) : null}
      </div>
      <div className="intake-mode-strip">
        {(Object.keys(modeDetails) as AnalysisMode[]).map((modeKey) => {
          const detail = modeDetails[modeKey];
          return (
            <button
              key={modeKey}
              type="button"
              className={mode === modeKey ? "mode-card active compact" : "mode-card compact"}
              onClick={() => setMode(modeKey)}
            >
              <span className="status-pill">{mode === modeKey ? "Selected" : "Available"}</span>
              <strong>{detail.label}</strong>
              <small>{detail.short}</small>
              <details>
                <summary>Requirements</summary>
                <p>{detail.requirements.join(", ")}</p>
              </details>
            </button>
          );
        })}
      </div>
      {showFirmwareWarning ? (
        <p className="muted">
          Firmware guidance requires schematic and PCB net evidence. Datasheet review is still required.
        </p>
      ) : null}
    </section>
  );
}
