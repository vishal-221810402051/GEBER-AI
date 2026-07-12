import { describe, expect, it } from "vitest";
import { parseGerber } from "../features/parsers/gerber";

const basic = `%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
D10*
X000000Y000000D03*
M02*`;

describe("Gerber X2 generic and file attributes", () => {
  it("parses TF with one value, multiple values, empty fields, and unknown attributes", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%TF.FileFunction,Copper,L1,Top*%
%TF.Empty,,Kept*%
%TF.Vendor.Unknown,A,B*%
%ADD10C,0.100*%
D10*
X000000Y000000D03*
M02*`, "x2-1", "top.gtl");

    expect(result.x2.fileAttributes.fileFunction?.rawFunction).toBe("Copper");
    expect(result.x2.fileAttributes.fileFunction?.rawModifiers).toEqual(["L1", "Top"]);
    expect(result.x2.fileAttributes.raw.find((attribute) => attribute.name === ".Empty")?.values).toEqual(["", "Kept"]);
    expect(result.x2.fileAttributes.unknown.map((attribute) => attribute.name)).toContain(".Vendor.Unknown");
  });

  it("parses standardized file attributes", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%TF.FilePolarity,Positive*%
%TF.Part,Single*%
%TF.GenerationSoftware,Vendor,App,1.2.3*%
%TF.CreationDate,2026-01-02T03:04:05Z*%
%TF.ProjectId,Board,RevA,GUID*%
%TF.MD5,abc123*%
%TF.SameCoordinates,JOB-1*%
${basic}`, "x2-2", "meta.gbr");

    expect(result.x2.fileAttributes.filePolarity?.polarity).toBe("Positive");
    expect(result.x2.fileAttributes.part?.value).toBe("Single");
    expect(result.x2.fileAttributes.generationSoftware?.application).toBe("App");
    expect(result.x2.fileAttributes.creationDate?.parsedIsoValue).toBe("2026-01-02T03:04:05.000Z");
    expect(result.x2.fileAttributes.projectId?.rawValues).toEqual(["Board", "RevA", "GUID"]);
    expect(result.x2.fileAttributes.md5?.value).toBe("abc123");
    expect(result.x2.fileAttributes.sameCoordinates?.identifier).toBe("JOB-1");
  });

  it("diagnoses malformed commands, missing names, value limits, value length limits, and duplicate file attributes", () => {
    const tooManyValues = Array.from({ length: 257 }, (_, index) => `v${index}`).join(",");
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%TF.FileFunction,Copper,L1,Top*%
%TF.FileFunction,Soldermask,Top*%
%TF,missing*%
%TF.Bad,broken\\q*%
%TF.TooMany,${tooManyValues}*%
%TF.TooLong,${"x".repeat(16_385)}*%
%ADD10C,0.100*%
D10*
X000000Y000000D03*
M02*`, "x2-3", "bad.gbr");

    const codes = result.diagnostics.map((diagnostic) => diagnostic.code);
    expect(codes).toContain("duplicate-x2-file-attribute");
    expect(codes).toContain("missing-x2-attribute-name");
    expect(codes).toContain("malformed-x2-attribute");
    expect(codes).toContain("x2-attribute-limit");
    expect(result.x2.summary.malformedAttributeCount).toBeGreaterThan(0);
  });
});
