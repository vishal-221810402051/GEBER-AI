import { describe, expect, it } from "vitest";
import { parseGerber } from "../features/parsers/gerber";

function gerber(body: string, header = "%FSLAX24Y24*%\n%MOMM*%") {
  return `${header}\n${body}\nM02*`;
}

describe("Gerber RS-274X parser", () => {
  it("parses metric format, circle aperture, move, line, flash and bounds", () => {
    const result = parseGerber(gerber(`
%ADD10C,0.100*%
D10*
X000000Y000000D02*
X010000Y000000D01*
X020000Y000000D03*
`), "g1", "top.gtl");

    expect(result.status).toBe("parsed");
    expect(result.units).toBe("mm");
    expect(result.coordinateFormat?.zeroSuppression).toBe("leading");
    expect(result.summary.apertureCount).toBe(1);
    expect(result.summary.lineCount).toBe(1);
    expect(result.summary.flashCount).toBe(1);
    expect(result.boundsMm?.minX).toBeCloseTo(-0.05);
    expect(result.boundsMm?.maxX).toBeCloseTo(2.05);
  });

  it("converts inch coordinates to millimetres", () => {
    const result = parseGerber(gerber(`
%ADD10C,0.010*%
D10*
X000000Y000000D02*
X010000Y000000D01*
`, "%FSLAX24Y24*%\n%MOIN*%"), "g2", "top.gtl");

    expect(result.units).toBe("inch");
    expect(result.primitives[0]).toMatchObject({ kind: "line" });
    expect(result.boundsMm?.maxX).toBeCloseTo(25.527, 3);
  });

  it("supports G70/G71 unit fallback commands", () => {
    const inch = parseGerber(gerber(`
G70*
%ADD10C,0.010*%
D10*
X010000Y000000D03*
`, "%FSLAX24Y24*%"), "g3", "legacy.gbr");
    const metric = parseGerber(gerber(`
G71*
%ADD10C,0.100*%
D10*
X010000Y000000D03*
`, "%FSLAX24Y24*%"), "g4", "legacy.gbr");

    expect(inch.units).toBe("inch");
    expect(metric.units).toBe("mm");
    expect(inch.boundsMm?.maxX).toBeGreaterThan(metric.boundsMm?.maxX ?? 0);
  });

  it("handles trailing-zero suppression, incremental mode, negative coordinates, and omitted modal axes", () => {
    const result = parseGerber(gerber(`
%ADD10C,0.100*%
D10*
X1Y-1D02*
X1D01*
Y1D01*
`, "%FSTIX24Y24*%\n%MOMM*%"), "g5", "bottom.gbl");

    expect(result.coordinateFormat?.zeroSuppression).toBe("trailing");
    expect(result.coordinateFormat?.coordinateMode).toBe("incremental");
    expect(result.summary.lineCount).toBe(2);
    expect(result.boundsMm?.minY).toBeLessThan(0);
  });

  it("diagnoses missing coordinate format and missing units", () => {
    const result = parseGerber(`
%ADD10C,0.100*%
D10*
X010000Y000000D03*
M02*
`, "g6", "bad.gbr");

    expect(result.status).toBe("failed");
    expect(result.diagnostics.map((item) => item.code)).toContain("missing-coordinate-format");
    expect(result.diagnostics.map((item) => item.code)).toContain("missing-units");
  });

  it("parses rectangle, obround, polygon and circular-hole modifiers", () => {
    const result = parseGerber(gerber(`
%ADD10R,1.0X2.0X0.2*%
%ADD11O,1.0X2.0*%
%ADD12P,1.0X6X45X0.1*%
D10*
X000000Y000000D03*
D11*
X020000Y000000D03*
D12*
X040000Y000000D03*
`), "g7", "shape.gbr");

    expect(result.apertures.map((aperture) => aperture.kind)).toEqual(["rectangle", "obround", "polygon"]);
    expect(result.apertures[0]).toMatchObject({ holeDiameterMm: 0.2 });
    expect(result.summary.flashCount).toBe(3);
  });

  it("diagnoses malformed and unknown apertures", () => {
    const result = parseGerber(gerber(`
%ADD10C,-1.0*%
D99*
X000000Y000000D03*
`), "g8", "bad-aperture.gbr");

    expect(result.diagnostics.map((item) => item.code)).toContain("malformed-aperture-definition");
    expect(result.diagnostics.map((item) => item.code)).toContain("unknown-aperture-selection");
    expect(result.diagnostics.map((item) => item.code)).toContain("draw-without-aperture");
  });

  it("detects unsupported aperture macros without approximating geometry", () => {
    const result = parseGerber(gerber(`
%AMTHERMAL*1,1,0.5,0,0*%
%ADD10THERMAL*%
D10*
X010000Y010000D03*
`), "g9", "macro.gbr");

    expect(result.apertures[0]).toMatchObject({ kind: "macro", supported: false });
    expect(result.geometryCoverage).toBe("unavailable");
    expect(result.diagnostics.map((item) => item.code)).toContain("unsupported-aperture-macro");
  });

  it("counts X2 attributes but defers semantic extraction", () => {
    const result = parseGerber(gerber(`
%TF.FileFunction,Copper,L1,Top*%
%TA.AperFunction,Conductor*%
%ADD10C,0.100*%
D10*
X000000Y000000D03*
`), "g10", "x2.gbr");

    expect(result.summary.x2AttributeCount).toBe(2);
    expect(result.diagnostics.map((item) => item.code)).toContain("x2-attributes-deferred");
  });
});
