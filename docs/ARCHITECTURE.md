# GEBER AI Architecture

## Phase 4 Architecture Decision

Phase 4 adds a browser-side KiCad PCB parser MVP to the existing React + TypeScript + Vite application. The parser reads selected `.kicad_pcb` files locally in the browser and extracts layout-level facts only.

No backend routes, persistence, KiCad schematic parser, Gerber parser, BOM parser, electrical analysis, firmware mapping, report generation, or export workflow is introduced in Phase 4.

## Current Structure

```text
src/
|-- domain/
|-- features/
|   |-- intake/
|   |-- parsers/
|   |   `-- kicad-pcb/
|   |       |-- extractKicadPcbSummary.ts
|   |       |-- kicadPcbTypes.ts
|   |       |-- kicadSexpr.ts
|   |       `-- parseKicadPcb.ts
|   `-- project-model/
|-- pages/
|-- styles/
`-- main.tsx
```

## KiCad PCB Parser Boundary

The Phase 4 parser supports KiCad S-expression style PCB files and extracts:

- Board metadata where present.
- Layer declarations.
- Net declarations.
- Footprints and layout-level properties.
- Pad summaries and pad net references.
- Track segments.
- Vias.
- Zone summaries.
- Edge.Cuts outline primitives.
- Approximate bounding box from parsed outline points when possible.

These are directly parsed layout facts. They do not establish schematic agreement, electrical correctness, manufacturing validity, BOM validity, or firmware behavior.

## Parser Status Integration

The normalized project model now allows the KiCad PCB parser stage to become `parsed` or `failed`. File classification remains metadata-based. All parser stages beyond KiCad PCB remain future-stage or unavailable models.

## Error Handling

The parser returns structured diagnostics for:

- Empty files.
- Invalid S-expressions.
- Missing top-level `kicad_pcb`.
- Missing layers.
- Missing nets.
- Missing footprints.
- Missing Edge.Cuts outline data.
- Large browser-side file parsing warnings.

## Recommended Next Architecture Steps

Phase 5 should begin the KiCad Schematic Parser MVP. That work should populate schematic-level models without introducing electrical analysis, firmware mapping, report generation, or export logic.
