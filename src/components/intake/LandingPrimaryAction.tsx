import { Link } from "react-router-dom";
import type { LandingReadiness } from "../../features/intake/landingReadiness";

type LandingPrimaryActionProps = Readonly<{
  readiness: LandingReadiness;
}>;

export function LandingPrimaryAction({ readiness }: LandingPrimaryActionProps) {
  return (
    <section className="landing-action-card" aria-label="Start workflow">
      <div>
        <span className="eyebrow">Next</span>
        <h2>{readiness.actionLabel}</h2>
        <p>
          Phase B uses the closest existing output route. A dedicated processing
          and result flow is reserved for later realignment phases.
        </p>
      </div>
      {readiness.canStart ? (
        <Link to={readiness.actionTarget} className="primary-action landing-start-action">
          {readiness.actionLabel}
        </Link>
      ) : (
        <button type="button" className="primary-action landing-start-action" disabled>
          {readiness.actionLabel}
        </button>
      )}
      {readiness.missingRequirement ? (
        <p className="muted">{readiness.missingRequirement}</p>
      ) : (
        <p className="muted">
          Continue with evidence-based output. Engineering review remains required.
        </p>
      )}
    </section>
  );
}
