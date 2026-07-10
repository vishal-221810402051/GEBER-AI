import { describe, expect, it } from "vitest";
import {
  fromInternalIntakeMode,
  toInternalIntakeMode
} from "../features/intake/publicModeAdapter";
import { buildLandingReadiness } from "../features/intake/landingReadiness";
import type { ClassifiedFile, FileCategory } from "../features/intake/intakeTypes";

function file(category: FileCategory): ClassifiedFile {
  return {
    id: category,
    file: {} as File,
    name: `sample.${category}`,
    sizeBytes: 100,
    mimeType: "",
    extension: category,
    category,
    categoryLabel: category,
    confidence: "direct",
    completenessContribution: "",
    requiresParser: false,
    note: ""
  };
}

describe("Product Realignment Phase B public mode adapter", () => {
  it("maps Inspect to the temporary internal analyze mode", () => {
    expect(toInternalIntakeMode("inspect")).toBe("analyze");
  });

  it("maps Firmware to the existing internal firmware mode", () => {
    expect(toInternalIntakeMode("firmware")).toBe("firmware");
  });

  it("does not expose the legacy basic mode publicly", () => {
    expect(fromInternalIntakeMode("basic")).toBe("inspect");
    expect(fromInternalIntakeMode("analyze")).toBe("inspect");
    expect(fromInternalIntakeMode("firmware")).toBe("firmware");
  });
});

describe("Product Realignment Phase B landing readiness", () => {
  it("keeps Inspect disabled without schematic evidence", () => {
    const readiness = buildLandingReadiness("inspect", [file("gerber")]);

    expect(readiness.canStart).toBe(false);
    expect(readiness.missingRequirement).toContain("schematic");
  });

  it("keeps Inspect disabled without manufacturing evidence", () => {
    const readiness = buildLandingReadiness("inspect", [file("kicad-schematic")]);

    expect(readiness.canStart).toBe(false);
    expect(readiness.missingRequirement).toContain("Gerber");
  });

  it("enables Inspect with schematic and manufacturing file presence", () => {
    const readiness = buildLandingReadiness("inspect", [
      file("kicad-schematic"),
      file("gerber")
    ]);

    expect(readiness.canStart).toBe(true);
    expect(readiness.notices).toContain(
      "Gerber files detected. Geometry analysis is not implemented yet."
    );
  });

  it("keeps Firmware disabled without schematic evidence", () => {
    const readiness = buildLandingReadiness("firmware", [file("kicad-pcb")]);

    expect(readiness.canStart).toBe(false);
    expect(readiness.missingRequirement).toContain("schematic");
  });
});
