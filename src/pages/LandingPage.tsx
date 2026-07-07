import { Link } from "react-router-dom";

const capabilities = [
  "File intake",
  "KiCad PCB parser",
  "KiCad schematic parser",
  "BOM and placement parser",
  "Net classification",
  "Decoupling and bias evidence",
  "Placement and power analysis",
  "Firmware guidance",
  "Engineering report exports"
];

export function LandingPage() {
  return (
    <section className="home-console">
      <div className="home-command-card">
        <span className="eyebrow">Local PCB intelligence workspace</span>
        <h1>GEBER AI</h1>
        <p className="tagline">
          Analyze PCB project files, inspect evidence, and generate engineering
          guidance from KiCad, BOM, placement, and report data.
        </p>
        <div className="hero-actions">
          <Link to="/intake" className="primary-action">
            Start Intake
          </Link>
          <Link to="/dashboard" className="secondary-action link-action">
            View Dashboard
          </Link>
        </div>

        <div className="capability-strip" aria-label="Available capabilities">
          {capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
