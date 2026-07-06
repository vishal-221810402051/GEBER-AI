# GEBER AI Architecture

## Phase 6 Architecture Decision

Phase 6 adds browser-side table parsers for BOM and pick-and-place / centroid files. The parsers read selected files locally in the browser and extract table-level facts only.

No backend routes, persistence, BOM-to-PCB validation, placement-to-PCB validation, electrical analysis, firmware mapping, report generation, or production export workflow is introduced in Phase 6.

## Current Structure

```text
src/
|-- domain/
|-- features/
|   |-- intake/
|   |-- parsers/
|   |   |-- bom/
|   |   |-- kicad-pcb/
|   |   |-- kicad-schematic/
|   |   |-- placement/
|   |   `-- shared/
|   `-- project-model/
|-- pages/
|-- styles/
`-- main.tsx
```

## BOM Parser Boundary

The Phase 6 BOM parser supports CSV/TSV/simple delimited text and extracts:

- Reference designators.
- Quantity.
- Value.
- Footprint/package.
- Description.
- Manufacturer and supplier part fields.
- Tolerance, voltage, current, notes, and unknown extra fields.

Spreadsheet files are recognized, but `.xlsx` and `.xls` parsing is not implemented in Phase 6.

## Placement Parser Boundary

The Phase 6 placement parser supports common delimited centroid files and extracts:

- Reference designator.
- X/Y coordinates.
- Rotation.
- Top/bottom/unknown side.
- Footprint/package.
- Value.

Placement data is not compared against PCB coordinates in Phase 6.

## Parser Status Integration

The normalized project model now allows BOM and pick-and-place parser stages to become parsed or failed. KiCad PCB and KiCad schematic parser status remain independent. All analysis-oriented stages remain future-stage or unavailable models.

## Recommended Next Architecture Steps

Phase 7 should begin Net Explorer and Net Classification. That work should keep inferred net classification separate from parsed facts and avoid electrical correctness validation unless explicitly authorized.
