import { describe, expect, it } from "vitest";
import { parseBom } from "../features/parsers/bom/parseBom";
import { parseReferenceDesignators } from "../features/parsers/bom/referenceDesignators";
import { parsePlacement } from "../features/parsers/placement/parsePlacement";

describe("BOM and placement parsers", () => {
  it("parses BOM CSV and reference ranges", () => {
    const result = parseBom("Reference,Qty,Value,Footprint\nR1-R3,3,10k,0603", "bom", "bom.csv");
    expect(result.rows[0]?.referenceDesignators).toEqual(["R1", "R2", "R3"]);
    expect(parseReferenceDesignators("C1-C2")).toEqual(["C1", "C2"]);
  });

  it("parses semicolon BOM data", () => {
    const result = parseBom("Refs;Quantity;Value\nC1;1;100nF", "bom", "bom.csv");
    expect(result.rows[0]?.value).toBe("100nF");
  });

  it("reports missing required BOM columns", () => {
    const result = parseBom("Value\n10k", "bom", "bom.csv");
    expect(result.diagnostics.some((item) => item.message === "Missing reference column.")).toBe(true);
  });

  it("parses placement CSV and diagnoses unknown side", () => {
    const result = parsePlacement("Ref,X,Y,Rot,Side\nU1,1,2,90,middle", "pnp", "placement.csv");
    expect(result.rows[0]?.x).toBe(1);
    expect(result.rows[0]?.side).toBe("unknown");
    expect(result.diagnostics.some((item) => item.message === "Placement row has unknown side value.")).toBe(true);
  });
});
