import { describe, expect, it } from "vitest";
import { parseGerber } from "../features/parsers/gerber";

describe("Gerber X2 aperture and object lifecycle", () => {
  it("attaches TA attributes to subsequent apertures and keeps earlier apertures immutable", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%TA.AperFunction,Conductor*%
%ADD10C,0.100*%
%TA.AperFunction,ComponentPad*%
%ADD11C,0.200*%
%TD.AperFunction*%
%ADD12C,0.300*%
D10*
X000000Y000000D03*
D11*
X010000Y000000D03*
D12*
X020000Y000000D03*
M02*`, "life-1", "apertures.gbr");

    const [a10, a11, a12] = result.apertures;
    expect(a10.apertureAttributeSetId).toBeTruthy();
    expect(a11.apertureAttributeSetId).toBeTruthy();
    expect(a12.apertureAttributeSetId).toBeUndefined();
    expect(result.x2.apertureAttributeSets[a10.apertureAttributeSetId ?? ""]?.interpreted.apertureFunction?.value).toBe("Conductor");
    expect(result.x2.apertureAttributeSets[a11.apertureAttributeSetId ?? ""]?.interpreted.apertureFunction?.value).toBe("ComponentPad");
  });

  it("clears active aperture attributes with unnamed TD and retains macro aperture metadata", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%AMMACRO*1,1,0.5,0,0*%
%TA.AperFunction,ViaPad*%
%ADD10MACRO*%
%TD*%
%ADD11C,0.100*%
M02*`, "life-2", "macro.gbr");

    expect(result.apertures[0].kind).toBe("macro");
    expect(result.apertures[0].apertureAttributeSetId).toBeTruthy();
    expect(result.apertures[1].apertureAttributeSetId).toBeUndefined();
  });

  it("attaches object attributes to line, arc, flash, and region primitives but not moves", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
D10*
%TO.N,NET_A*%
X000000Y000000D02*
X010000Y000000D01*
G02X020000Y000000I005000J000000D01*
X030000Y000000D03*
G36*
X040000Y000000D02*
X050000Y000000D01*
X050000Y010000D01*
X040000Y000000D01*
G37*
M02*`, "life-3", "objects.gbr");

    expect(result.primitives).toHaveLength(4);
    expect(result.primitives.every((primitive) => primitive.objectAttributeSetId)).toBe(true);
    const setId = result.primitives[0].objectAttributeSetId ?? "";
    expect(result.x2.objectAttributeSets[setId].interpreted.net?.name).toBe("NET_A");
  });

  it("parses object pin and component metadata and deletion affects later objects only", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
D10*
%TO.C,U1*%
%TO.P,U1,5*%
X000000Y000000D03*
%TD.P*%
X010000Y000000D03*
%TD*%
X020000Y000000D03*
M02*`, "life-4", "pins.gbr");

    const firstSet = result.x2.objectAttributeSets[result.primitives[0].objectAttributeSetId ?? ""];
    const secondSet = result.x2.objectAttributeSets[result.primitives[1].objectAttributeSetId ?? ""];
    expect(firstSet.interpreted.component?.reference).toBe("U1");
    expect(firstSet.interpreted.pin?.pinNumber).toBe("5");
    expect(secondSet.interpreted.component?.reference).toBe("U1");
    expect(secondSet.interpreted.pin).toBeUndefined();
    expect(result.primitives[2].objectAttributeSetId).toBeUndefined();
  });

  it("interns equal attribute dictionaries deterministically", () => {
    const result = parseGerber(`%FSLAX24Y24*%
%MOMM*%
%ADD10C,0.100*%
D10*
%TO.N,NET_A*%
X000000Y000000D03*
X010000Y000000D03*
%TO.C,U1*%
X020000Y000000D03*
M02*`, "life-5", "intern.gbr");

    expect(result.primitives[0].objectAttributeSetId).toBe(result.primitives[1].objectAttributeSetId);
    expect(result.primitives[2].objectAttributeSetId).not.toBe(result.primitives[0].objectAttributeSetId);
    expect(Object.keys(result.x2.objectAttributeSets)).toHaveLength(2);
  });
});
