import { PROJECT_MODE_DEFINITIONS, type ProjectMode } from "../../domain/workflow";

type PublicModeSelectorProps = Readonly<{
  mode: ProjectMode;
  onModeChange: (mode: ProjectMode) => void;
}>;

const details: Record<ProjectMode, string> = {
  inspect: "Requires schematic files and Gerber/package files.",
  firmware: "Uses schematic evidence first and Gerber evidence only where facts are supported."
};

const options = [
  PROJECT_MODE_DEFINITIONS.inspect,
  PROJECT_MODE_DEFINITIONS.firmware
] as const;

export function PublicModeSelector({ mode, onModeChange }: PublicModeSelectorProps) {
  return (
    <section className="landing-mode-section" aria-label="Project mode">
      <span className="eyebrow">Mode</span>
      <div className="landing-mode-grid" role="radiogroup" aria-label="Choose project mode">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={mode === option.id ? "public-mode-card active" : "public-mode-card"}
            aria-pressed={mode === option.id}
            role="radio"
            aria-checked={mode === option.id}
            onClick={() => onModeChange(option.id)}
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
            <small>{details[option.id]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
