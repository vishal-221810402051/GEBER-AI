import { describe, expect, it } from "vitest";
import { classifyNet } from "../features/net-explorer/classifyNet";
import { csvCell, tableToCsv } from "../features/export/csv";

describe("net classification", () => {
  it("classifies common firmware and power nets", () => {
    expect(classifyNet("GND").classification).toBe("Ground");
    expect(classifyNet("+3V3").classification).toBe("Power");
    expect(classifyNet("I2C_SDA").classification).toBe("I2C");
    expect(classifyNet("SPI_MOSI").classification).toBe("SPI");
    expect(classifyNet("UART_TX").classification).toBe("UART");
    expect(classifyNet("USB_D+").classification).toBe("USB");
    expect(classifyNet("CAN_H").classification).toBe("CAN");
    expect(classifyNet("MYSTERY_NET").classification).toBe("Unknown");
  });
});

describe("CSV export", () => {
  it("escapes commas, quotes, and newlines", () => {
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });

  it("builds deterministic CSV tables", () => {
    const csv = tableToCsv({
      filename: "test.csv",
      columns: ["name", "value"],
      rows: [{ name: "R1", value: "10k" }]
    });
    expect(csv).toBe("name,value\nR1,10k");
  });
});
