import { PlannedCard } from "../components/cards/PlannedCard";
import { PageHeader } from "./shared/PageHeader";

export function FirmwarePage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Firmware report"
        title="Firmware documentation is planned"
        description="Future firmware mode will map hardware evidence to MCU pins, peripherals, connectors, and a bring-up manual when supported source files are available."
      />
      <div className="card-grid">
        <PlannedCard
          title="MCU detection"
          status="Future phase"
          description="Planned detection from schematic, board, BOM, and placement facts."
        />
        <PlannedCard
          title="Pin and peripheral mapping"
          status="Future phase"
          description="Planned mapping for GPIO, UART, I2C, SPI, USB, CAN, PWM, ADC, reset, clock, and connector signals."
        />
        <PlannedCard
          title="Bring-up manual"
          status="Future phase"
          description="Planned engineering documentation after real pin maps and confidence scoring exist."
        />
      </div>
    </section>
  );
}
