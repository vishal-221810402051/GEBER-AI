# GEBER AI Architecture

## Phase 5 Architecture Decision

Phase 5 adds a browser-side KiCad schematic parser MVP to the existing React + TypeScript + Vite application. The parser reads selected `.kicad_sch` files locally in the browser and extracts schematic-level facts only.

No backend routes, persistence, BOM parser, pick-and-place parser, schematic-to-PCB comparison, electrical analysis, firmware mapping, report generation, or export workflow is introduced in Phase 5.

## Current Structure

```text
src/
|-- domain/
|-- features/
|   |-- intake/
|   |-- parsers/
|   |   |-- kicad-pcb/
|   |   `-- kicad-schematic/
|   |       |-- extractKicadSchematicSummary.ts
|   |       |-- kicadSchematicTypes.ts
|   |       `-- parseKicadSchematic.ts
|   `-- project-model/
|-- pages/
|-- styles/
`-- main.tsx
```

## KiCad Schematic Parser Boundary

The Phase 5 parser supports KiCad S-expression style schematic files and extracts:

- Schematic metadata and title block where present.
- Library symbol definitions and pin metadata where available.
- Schematic symbol/component instances.
- Symbol properties such as Reference, Value, Footprint, Datasheet, and Description.
- Local, global, hierarchical, and text labels.
- Wire primitives.
- Junctions and no-connect markers.
- Hierarchical sheet metadata.

These are directly parsed schematic facts. They do not establish PCB agreement, electrical correctness, manufacturing validity, BOM validity, or firmware behavior.

## Parser Status Integration

The normalized project model now allows the KiCad schematic parser stage to become `parsed` or `failed`. KiCad PCB parser status remains independent. All parser stages beyond KiCad PCB and KiCad schematic remain future-stage or unavailable models.

## Error Handling

The schematic parser returns structured diagnostics for:

- Empty files.
- Invalid S-expressions.
- Missing top-level `kicad_sch`.
- Missing `lib_symbols`.
- Missing symbol instances.
- Missing labels.
- Missing wires.
- Large browser-side file parsing warnings.

## Recommended Next Architecture Steps

Phase 6 should begin BOM and pick-and-place parser MVPs. That work should populate parsed BOM and placement models without introducing electrical validation, firmware mapping, report generation, or export logic.
