import { PageHeader } from "./shared/PageHeader";

const categories = [
  "Power",
  "Ground",
  "Clock",
  "Reset",
  "UART",
  "I2C",
  "SPI",
  "USB",
  "CAN",
  "PWM",
  "ADC",
  "GPIO"
];

export function NetsPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Net explorer"
        title="Net classification is planned"
        description="Future parser and analysis phases will classify nets by source evidence, naming conventions, connectivity, and confidence scoring."
      />
      <div className="tag-list large">
        {categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
      <div className="notice-panel">
        <span className="status-pill">Missing data</span>
        <p>No nets are displayed until real project files are uploaded and parsed.</p>
      </div>
    </section>
  );
}
