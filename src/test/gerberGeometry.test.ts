import { describe, expect, it } from "vitest";
import { parseGerber } from "../features/parsers/gerber";

const header = "%FSLAX24Y24*%\n%MOMM*%\n%ADD10C,0.100*%\nD10*";

describe("Gerber geometry primitives", () => {
  it("parses clockwise and counterclockwise arcs with arc-aware bounds", () => {
    const result = parseGerber(`${header}
X000000Y000000D02*
G02X010000Y000000I005000J000000D01*
G03X000000Y000000I-005000J000000D01*
M02*`, "arc", "arc.gbr");

    expect(result.summary.arcCount).toBe(2);
    expect(result.boundsMm?.maxY).toBeCloseTo(0.55, 1);
    expect(result.boundsMm?.minY).toBeCloseTo(-0.05, 1);
  });

  it("diagnoses single-quadrant arc ambiguity and arc radius mismatch", () => {
    const result = parseGerber(`${header}
G74*
X000000Y000000D02*
G02X010000Y010000I005000J000000D01*
M02*`, "arc2", "single.gbr");

    expect(result.diagnostics.map((item) => item.code)).toContain("ambiguous-single-quadrant-arc");
    expect(result.diagnostics.map((item) => item.code)).toContain("arc-radius-mismatch");
  });

  it("preserves region contours and multiple contours", () => {
    const result = parseGerber(`${header}
G36*
X000000Y000000D02*
X010000Y000000D01*
X010000Y010000D01*
X000000Y010000D01*
X000000Y000000D01*
X020000Y020000D02*
X030000Y020000D01*
X030000Y030000D01*
X020000Y030000D01*
X020000Y020000D01*
G37*
M02*`, "region", "region.gbr");

    expect(result.summary.regionCount).toBe(1);
    const region = result.primitives.find((primitive) => primitive.kind === "region");
    if (region?.kind !== "region") {
      throw new Error("Expected a parsed region primitive.");
    }
    expect(region.contours).toHaveLength(2);
  });

  it("diagnoses unclosed regions, missing M02, and empty geometry", () => {
    const result = parseGerber(`${header}
G36*
X000000Y000000D02*
X010000Y000000D01*`, "bad-region", "bad-region.gbr");

    expect(result.diagnostics.map((item) => item.code)).toContain("unclosed-region");
    expect(result.diagnostics.map((item) => item.code)).toContain("missing-m02");
    expect(result.summary.regionCount).toBe(0);
  });

  it("keeps clear polarity on primitives", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
%LPC*%
D10*
X000000Y000000D03*
M02*`, "clear", "clear.gbr");

    expect(result.summary.clearPrimitiveCount).toBe(1);
    expect(result.primitives[0]).toMatchObject({ polarity: "clear" });
  });
});
