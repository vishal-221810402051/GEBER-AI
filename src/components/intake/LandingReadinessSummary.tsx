import type { FirmwareManualSummary } from "../../domain/firmware";
import type { CompletenessSummary } from "../../features/intake/intakeTypes";
import type { LandingReadiness } from "../../features/intake/landingReadiness";
import { GlassStatusCard, RadialProgress } from "../ui";

type LandingReadinessSummaryProps = Readonly<{
  readiness: LandingReadiness;
  completeness: CompletenessSummary;
  totalFiles: number;
  parsedFiles: number;
  warningCount: number;
  firmwareSummary?: FirmwareManualSummary;
}>;

export function LandingReadinessSummary({
  readiness,
  completeness,
  totalFiles,
  parsedFiles,
  warningCount,
  firmwareSummary
}: LandingReadinessSummaryProps) {
  const scoreTone = completeness.score >= 80
    ? "success"
    : completeness.score >= 45
      ? "warning"
      : "active";

  return (
    <section className="landing-readiness-card" aria-label="File readiness summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Readiness</span>
          <h2>File readiness summary</h2>
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
        {readiness.items.map((item) => (
          <article key={item.label} className={`readiness-check ${item.tone}`}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </div>

      {readiness.mode === "firmware" && firmwareSummary ? (
        <div className="landing-firmware-facts">
          <span>MCU candidates <strong>{firmwareSummary.mcuCandidates}</strong></span>
          <span>Pin map entries <strong>{firmwareSummary.pinMapEntries}</strong></span>
          <span>Readiness <strong>{firmwareSummary.readiness}</strong></span>
        </div>
      ) : null}

      {readiness.notices.length ? (
        <div className="landing-readiness-notices">
          {readiness.notices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
