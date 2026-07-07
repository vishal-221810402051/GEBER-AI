# GEBER AI Architecture

## Phase 9 Architecture Decision

Phase 9 extends the normalized project analysis object with deterministic placement and power-tree heuristics. The analysis uses only parsed local evidence from earlier phases and remains browser-only.

No backend routes, persistence, datasheet scraping, Firmware Mode, MCU firmware pin mapping, full report generation, export workflows, production readiness claims, full manufacturing validation, or full electrical validation are introduced in Phase 9.

## Current Structure

```text
src/
|-- domain/
|   |-- analysis.ts
|   |-- placement.ts
|   |-- power.ts
|   `-- nets.ts
|-- features/
|   |-- analysis/
|   |   |-- placement/
|   |   |-- power-tree/
|   |   |-- decoupling/
|   |   |-- pull-resistors/
|   |   `-- shared/
|   |-- net-explorer/
|   |-- parsers/
|   `-- project-model/
|-- pages/
`-- styles/
```

## Analysis Boundary

Phase 9 analysis is deterministic and evidence-based. It uses:

- PCB footprint positions, pad nets, layers, tracks, vias, zones, and outline bounding box when available.
- Pick-and-place coordinates, side, and rotation when available.
- Schematic symbols and metadata.
- BOM values, descriptions, part numbers, and current-rating fields when available.
- Phase 7 net classifications.
- Phase 8 component roles, decoupling candidates, and pull-resistor evidence.

Every Phase 9 finding includes evidence, confidence, limitations, required files for stronger validation, and `fullValidationComplete: false`.

Allowed claims:

- Placement evidence suggests proximity or missing coordinate data.
- Connector edge proximity is estimated from parsed board bounding box.
- A regulator candidate is detected from name/role/connectivity evidence.
- A rail is detected by net classification and PCB connectivity.
- Current is unknown unless explicit current data exists in parsed files.

Forbidden claim examples:

- Placement is correct.
- Assembly is validated.
- Power design is valid.
- Regulator sizing is correct.
- Thermal design is verified.
- Board is production-ready.
- Firmware mapping is complete.
- A full report has been generated.

## Recommended Next Architecture Steps

Phase 10 should begin Firmware Mode. It should consume the existing normalized schematic, PCB, net, component, and analysis evidence without claiming firmware mapping is complete until the required data and validation exist.
