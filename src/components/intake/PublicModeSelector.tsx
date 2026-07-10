import type { PublicProjectMode } from "../../features/intake/publicModeAdapter";

type PublicModeSelectorProps = Readonly<{
  mode: PublicProjectMode;
  onModeChange: (mode: PublicProjectMode) => void;
}>;

const options: readonly {
  mode: PublicProjectMode;
  label: string;
  description: string;
  detail: string;
}[] = [
  {
    mode: "inspect",
    label: "Inspect / Analysis",
    description: "Build a prioritized engineering inspection from available schematic and manufacturing evidence.",
    detail: "Best with schematic, Gerber/drill package, native PCB, BOM, and placement evidence."
  },
  {
    mode: "firmware",
    label: "Firmware",
    description: "Build a firmware-development document from schematic-first pin, bus, connector, and power evidence.",
    detail: "Best with schematic plus native PCB context for pads and nets."
  }
];

export function PublicModeSelector({ mode, onModeChange }: PublicModeSelectorProps) {
  return (
    <section className="landing-mode-section" aria-label="Project mode">
      <span className="eyebrow">Mode</span>
      <div className="landing-mode-grid" role="radiogroup" aria-label="Choose project mode">
        {options.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={mode === option.mode ? "public-mode-card active" : "public-mode-card"}
            aria-pressed={mode === option.mode}
            role="radio"
            aria-checked={mode === option.mode}
            onClick={() => onModeChange(option.mode)}
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
