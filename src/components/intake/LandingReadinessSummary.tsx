import type { ProjectInputPackage } from "../../domain/workflow";
import type { CompletenessSummary } from "../../features/intake/intakeTypes";
import type { WorkflowReadiness } from "../../features/workflow";
import { GlassStatusCard, RadialProgress } from "../ui";

type LandingReadinessSummaryProps = Readonly<{
  readiness: WorkflowReadiness;
  inputPackage: ProjectInputPackage;
  completeness: CompletenessSummary;
  totalFiles: number;
  parsedFiles: number;
  warningCount: number;
}>;

export function LandingReadinessSummary({
  readiness,
  inputPackage,
  completeness,
  totalFiles,
  parsedFiles,
  warningCount
}: LandingReadinessSummaryProps) {
  const scoreTone = completeness.score >= 80
    ? "success"
    : completeness.score >= 45
      ? "warning"
      : "active";
  const hasSchematic = inputPackage.schematicFiles.length > 0;
  const hasGerber = inputPackage.gerberFiles.length > 0;

  return (
    <section className="landing-readiness-card" aria-label="File readiness summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Readiness</span>
          <h2>Canonical input readiness</h2>
        </div>
        <span className="status-pill">{readiness.mode}</span>
      </div>

      <div className="landing-readiness-main">
        <RadialProgress
          value={completeness.score}
          label={`${completeness.score}/100`}
          caption={completeness.readinessLabel}
          tone={scoreTone}
          size={86}
        />
        <div className="landing-status-grid">
          <GlassStatusCard title="Files" value={totalFiles} tone={totalFiles ? "success" : "neutral"} />
          <GlassStatusCard title="Parsed" value={parsedFiles} tone={parsedFiles ? "success" : "neutral"} />
          <GlassStatusCard title="Warnings" value={warningCount} tone={warningCount ? "warning" : "success"} />
        </div>
      </div>

      <div className="readiness-check-list">
        <article className={hasSchematic ? "readiness-check success" : "readiness-check warning"}>
          <strong>Schematic files</strong>
          <span>
            {hasSchematic
              ? `${inputPackage.schematicFiles.length} schematic file(s) ready for logical evidence.`
              : "Required for both Inspect and Firmware modes."}
          </span>
        </article>
        <article className={hasGerber ? "readiness-check warning" : "readiness-check warning"}>
          <strong>Gerber/package files</strong>
          <span>
            {hasGerber
              ? `${inputPackage.gerberFiles.length} Gerber/package file(s) detected. Geometry parsing is not implemented yet.`
              : "Required by the locked schematic-plus-Gerber product input contract."}
          </span>
        </article>
      </div>

      <div className="landing-readiness-notices">
        {readiness.warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </section>
  );
}
