# GEBER AI Gerber X2 Attribute Parser

Product Realignment Phase D3 adds deterministic Gerber X2 attribute parsing on top of the Phase D2 RS-274X geometry parser.

## Scope

Supported canonical inputs remain:

- Schematic files.
- Gerber files or ZIP packages containing Gerber files.

The parser runs locally in the browser for direct Gerber uploads and ZIP-extracted Gerber entries. ZIP parents are not parsed as Gerber source.

## Supported Commands

- `%TF...*%`: file attributes.
- `%TA...*%`: aperture attributes.
- `%TO...*%`: object attributes.
- `%TD...*%`: deletion of active aperture/object attributes.

Attribute names, values, source blocks, and unknown attributes are preserved. Malformed commands produce structured diagnostics and do not stop geometry parsing when recovery is safe.

## Attribute Lifecycle

File attributes apply at file level.

Aperture attributes are modal:

- `TA` adds or replaces an active aperture attribute.
- The active aperture attribute dictionary is snapshotted when `%ADD...*%` defines an aperture.
- Later `TA` or `TD` commands do not mutate previously defined apertures.

Object attributes are modal:

- `TO` adds or replaces an active object attribute.
- The active object attribute dictionary is snapshotted when geometry is created.
- Moves do not create geometry and therefore do not create attributed objects.
- Regions use the object attributes active when the region begins.

`TD.Name` removes a matching active aperture/object attribute for future entities. Unnamed `TD` clears active aperture/object attributes. File attributes are not deleted by `TD`.

## Typed Interpretation

File attributes:

- `.FileFunction`
- `.FilePolarity`
- `.Part`
- `.GenerationSoftware`
- `.CreationDate`
- `.ProjectId`
- `.MD5`
- `.SameCoordinates`

Aperture attributes:

- `.AperFunction`
- `.DrillTolerance`

Object attributes:

- `.N` declared net metadata.
- `.P` declared pin/pad metadata.
- `.C` declared component-reference metadata.

Unknown attributes are preserved as raw declared metadata.

## Attribute-Set Interning

Aperture and object attribute dictionaries are interned into stable set IDs. Apertures and primitives store only a compact attribute-set ID instead of duplicating full metadata across many objects.

Equal dictionaries reuse the same ID. Different dictionaries receive different deterministic IDs.

## Declared Layer Classification

X2 `.FileFunction` is used as declared layer metadata with higher evidentiary weight than filename inference. Filename inference remains visible when it conflicts with X2.

Allowed wording:

- Declared top copper layer.
- Declared profile layer.
- X2-declared layer function differs from filename inference.

Disallowed wording:

- Verified board profile.
- Complete stack-up.
- Manufacturing validated.

## Safety Limits

```ts
GERBER_ATTRIBUTE_LIMITS = {
  maxAttributesPerFile: 100_000,
  maxValuesPerAttribute: 256,
  maxAttributeNameLength: 256,
  maxAttributeValueLength: 16_384,
  maxAttributeSetCount: 100_000,
};
```

Visible attribute values are rendered as text. The parser does not evaluate attribute text, use HTML injection, send backend requests, or send AI requests.

## Explicit Non-Claims

D3 does not implement:

- Excellon drill parsing.
- Drill-to-copper analysis.
- Schematic-Gerber correlation.
- Schematic-derived BOM generation.
- Component-placement validation.
- Net connectivity reconstruction.
- DRC or DFM.
- Production readiness validation.
- `/processing` or `/result`.
- Backend or AI parsing.

Declared X2 nets, components, and pins are metadata only. They are not proof of schematic correctness, BOM completeness, placement validity, or firmware pin correctness.

Next phase: Product Realignment Phase D4 - Schematic-Gerber Evidence Correlation.
