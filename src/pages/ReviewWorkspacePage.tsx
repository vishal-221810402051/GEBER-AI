import { Link } from "react-router-dom";
import { ReviewWorkspace } from "../features/review/ReviewWorkspace";
import { useFileIntake } from "../features/intake/useFileIntake";

export function ReviewWorkspacePage() {
  const { files, normalizedProject } = useFileIntake();

  if (files.length === 0) {
    return (
      <section className="page-stack review-workspace">
        <div className="empty-state">
          <span className="status-pill">No project files loaded</span>
          <h1>Smart Review Workspace</h1>
          <p>
            Upload project files to summarize parsed evidence, risks, firmware
            readiness, report availability, and consent-gated AI Review.
          </p>
          <div className="hero-actions">
            <Link to="/intake" className="primary-action">Start from Intake</Link>
            <Link to="/dashboard" className="secondary-action">View Dashboard</Link>
          </div>
        </div>
      </section>
    );
  }

  return <ReviewWorkspace normalizedProject={normalizedProject} />;
}
