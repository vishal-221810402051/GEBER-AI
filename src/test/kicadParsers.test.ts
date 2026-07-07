import { describe, expect, it } from "vitest";
import { parseKiCadSexpr } from "../features/parsers/kicad-pcb/kicadSexpr";
import { parseKicadPcb } from "../features/parsers/kicad-pcb/parseKicadPcb";
import { parseKicadSchematic } from "../features/parsers/kicad-schematic/parseKicadSchematic";
import { minimalPcb } from "./fixtures/minimal.kicad_pcb";
import { minimalSchematic } from "./fixtures/minimal.kicad_sch";

describe("KiCad parser utilities", () => {
  it("parses S-expressions", () => {
    expect(parseKiCadSexpr("(root (child \"value\"))").items.length).toBe(2);
  });

  it("parses a minimal PCB fixture", () => {
    const result = parseKicadPcb(minimalPcb, "pcb", "minimal.kicad_pcb");
    expect(result.success).toBe(true);
    expect(result.summary.footprintCount).toBe(1);
    expect(result.summary.netCount).toBe(3);
  });

  it("parses a minimal schematic fixture", () => {
    const result = parseKicadSchematic(minimalSchematic, "sch", "minimal.kicad_sch");
    expect(result.success).toBe(true);
    expect(result.summary.symbolInstanceCount).toBe(1);
    expect(result.symbols[0]?.pins[0]?.name).toBe("GPIO8");
  });

  it("handles invalid PCB input gracefully", () => {
    const result = parseKicadPcb("(not_pcb)", "bad", "bad.kicad_pcb");
    expect(result.success).toBe(false);
    expect(result.diagnostics[0]?.severity).toBe("critical");
  });
});
