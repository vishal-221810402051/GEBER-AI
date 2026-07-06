import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

const dashboardCards = [
  "File completeness",
  "Parser confidence",
  "Components",
  "Nets",
  "Critical issues",
  "BOM status",
  "Firmware report status"
];

export function DashboardPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Project dashboard placeholders"
        description="Dashboard cards are visible as planned surfaces only. They do not contain real project data because upload, classification, parsing, and analysis are not implemented."
      />
      <div className="card-grid dashboard-grid">
        {dashboardCards.map((title) => (
          <PlannedCard
            key={title}
            title={title}
            status="Not yet analyzed"
            description="Requires uploaded project files and future parser phases."
          />
        ))}
      </div>
    </section>
  );
}
