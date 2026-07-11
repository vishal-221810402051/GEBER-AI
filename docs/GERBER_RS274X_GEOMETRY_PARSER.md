# GEBER AI Gerber RS-274X Geometry Parser

Product Realignment Phase D2 adds deterministic browser-side RS-274X geometry parsing for canonical Gerber files.

## Scope

The parser runs locally for:

- Directly uploaded Gerber files.
- Gerber files extracted from ZIP packages in Phase D1.

ZIP package parents are not parsed as Gerber source.

## Supported Statements

- `%FS...*%` coordinate format.
- `%MO...*%` units.
- `%ADD...*%` aperture definitions.
- `%LPD*%` and `%LPC*%` polarity.
- `%AM...*%` macro detection and preservation.
- `%TF...*%`, `%TA...*%`, `%TO...*%`, and `%TD...*%` detection/counting only.
- `G01`, `G02`, `G03`, `G04`, `G36`, `G37`, `G70`, `G71`, `G74`, `G75`, `G90`, `G91`.
- `D01`, `D02`, `D03`, and aperture selection `D10+`.
- `M02`.

## Apertures

Supported standard apertures:

- Circle.
- Rectangle.
- Obround.
- Polygon.

All dimensions are normalized to millimetres. Circular-hole modifiers are preserved where valid.

Aperture macros are detected and preserved by name, but macro geometry is not evaluated or approximated. Macro-based draw/flash geometry is diagnosed as unsupported and can make bounds partial or unavailable.

## Coordinate Decoding

The parser supports:

- Leading-zero suppression.
- Trailing-zero suppression.
- Explicit positive and negative signs.
- Omitted modal X/Y values.
- Absolute notation.
- Incremental notation.
- Separate X/Y integer and decimal digit counts.
- Inch-to-millimetre conversion.
- I/J arc offsets using the active coordinate format.

If coordinate format or units are missing when coordinates are encountered, the parser emits structured diagnostics instead of guessing precision.

## Geometry Model

The parser emits evidence-linked vector primitives:

- Lines.
- Arcs.
- Flashes.
- Regions with line/arc contour segments.

Each primitive keeps source block, polarity, and aperture context where applicable. The parser does not perform copper union/subtraction and does not flatten arcs into fake line geometry.

## Bounds

The parser calculates parsed file bounds in millimetres when reliable supported geometry exists.

Bounds include:

- Line extents plus supported aperture stroke width.
- Arc sweep extrema plus supported aperture stroke width.
- Flash extents for supported standard apertures.
- Region contour extents.

Bounds exclude unsupported macro geometry. Bounds are labeled as parsed file or layer geometry bounds, never verified board dimensions.

## Diagnostics

Diagnostics are structured and include codes, severity, messages, source block where available, and raw statement where useful.

Important categories:

- Missing coordinate format.
- Missing units.
- Malformed aperture definition.
- Unknown aperture selection.
- Draw or flash without aperture.
- Unsupported aperture macro.
- Unsupported statement.
- X2 attributes deferred.
- Invalid coordinate.
- Arc radius mismatch.
- Ambiguous single-quadrant arc.
- Unclosed region.
- Unexpected region end.
- Missing `M02`.
- Empty geometry.
- Partial bounding box.
- File-size or block-count safety limit.

## Safety Limits

```ts
GERBER_PARSER_LIMITS = {
  maxSourceBytes: 50 * 1024 * 1024,
  maxBlocks: 2_000_000,
  maxApertures: 10_000,
  maxPrimitives: 2_000_000,
  maxDiagnostics: 5_000,
};
```

The parser avoids recursive parsing, unbounded geometry expansion, catastrophic regular expressions, backend upload, and AI parsing.

## UI and Model Integration

Gerber parser results are stored in the intake provider by canonical Gerber file ID. Direct Gerber files and package-extracted entries share the same result contract.

The normalized project stores Gerber parse results and an aggregate summary, not raw Gerber source text.

The file inventory displays:

- Parser status.
- Units.
- Aperture count.
- Primitive count.
- Geometry coverage.
- Parsed bounds where available.
- Collapsed diagnostics.

## Explicit Non-Claims

D2 does not implement:

- Excellon drill parsing.
- Gerber X2 semantic extraction.
- Schematic-to-Gerber correlation.
- Schematic-derived BOM generation.
- Component placement validation.
- Clearance, annular ring, impedance, thermal, or DFM checks.
- Production readiness validation.
- Backend parsing.
- AI parsing.

Next phase: Product Realignment Phase D3 - Excellon Drill and Gerber X2 Parser.
