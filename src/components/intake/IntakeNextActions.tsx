import { Link } from "react-router-dom";

type IntakeNextActionsProps = Readonly<{
  fileCount: number;
  hasPcbData: boolean;
  hasSchematicData: boolean;
  hasReport: boolean;
  hasFirmwareData: boolean;
}>;

export function IntakeNextActions({
  fileCount,
  hasPcbData,
  hasSchematicData,
  hasReport,
  hasFirmwareData
}: IntakeNextActionsProps) {
  const message = fileCount === 0
    ? "Upload project files to begin"
    : hasPcbData || hasSchematicData
      ? "Review parsed evidence and continue to the relevant workspace"
      : "Review detected files or add schematic and PCB evidence for stronger analysis";

  return (
    <section className="intake-next-actions">
      <div>
        <span className="eyebrow">Next action</span>
        <h2>{message}</h2>
      </div>
      <div className="hero-actions">
        <Link to="/dashboard" className="secondary-action link-action">
          Review detected files
        </Link>
        {hasPcbData ? (
          <Link to="/board" className="secondary-action link-action">
            View Board
          </Link>
        ) : null}
        {hasSchematicData ? (
          <>
            <Link to="/components" className="secondary-action link-action">
              View Components
            </Link>
            <Link to="/nets" className="secondary-action link-action">
              View Nets
            </Link>
          </>
        ) : null}
        {hasReport ? (
          <Link to="/reports" className="primary-action">
            View Engineering Report
          </Link>
        ) : null}
        {hasFirmwareData ? (
          <Link to="/firmware" className="secondary-action link-action">
            View Firmware Guidance
          </Link>
        ) : null}
      </div>
    </section>
  );
}
