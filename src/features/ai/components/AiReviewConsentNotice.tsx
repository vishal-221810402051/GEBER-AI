import { GlassAlert } from "../../../components/ui";

type AiReviewConsentNoticeProps = Readonly<{
  consent: boolean;
  disabled?: boolean;
  onConsentChange: (consent: boolean) => void;
}>;

export function AiReviewConsentNotice({
  consent,
  disabled = false,
  onConsentChange
}: AiReviewConsentNoticeProps) {
  return (
    <div className="ai-consent-stack">
      <GlassAlert
        variant="info"
        title="Structured evidence only"
        message="Only structured evidence from the deterministic report will be sent to the backend. Raw design files are not sent in this phase."
        compact
      />
      <label className="consent-row">
        <input
          type="checkbox"
          checked={consent}
          disabled={disabled}
          onChange={(event) => onConsentChange(event.target.checked)}
        />
        <span>I consent to send structured deterministic evidence to the local backend AI Review endpoint.</span>
      </label>
    </div>
  );
}
