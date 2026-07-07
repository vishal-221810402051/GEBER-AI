# GEBER AI Architecture

## Phase 10 Architecture Decision

Phase 10 adds a deterministic Firmware Mode manual on top of the normalized project, parsed schematic/PCB/BOM/placement data, net classifications, and prior analysis evidence. The manual is attached to `NormalizedPCBProject.firmware.manual`.

No backend routes, persistence, datasheet scraping, source-code generation, full engineering report generation, export workflows, production firmware, firmware correctness claims, completed schematic-to-PCB validation, or completed electrical validation are introduced in Phase 10.

## Current Structure

```text
src/
|-- domain/
|   |-- firmware.ts
|   |-- analysis.ts
|   |-- placement.ts
|   |-- power.ts
|   `-- nets.ts
|-- features/
|   |-- firmware/
|   |-- analysis/
|   |-- net-explorer/
|   |-- parsers/
|   `-- project-model/
|-- pages/
`-- styles/
```

## Firmware Mode Boundary

Firmware Mode is a documentation and interpretation layer. It uses:

- KiCad schematic symbols, properties, library pins, labels, and metadata.
- PCB footprints, pads, pad net references, layers, tracks, vias, zones, and coordinates.
- BOM rows and part metadata.
- Pick-and-place placement data.
- Net inventory and net classifications.
- Phase 8 decoupling and pull-up/pull-down evidence.
- Phase 9 placement and power-tree evidence.

Every mapping includes evidence, confidence, limitations, and missing data requirements where confidence is reduced.

Allowed claims:

- An MCU candidate was detected from parsed metadata.
- A net is mapped to a peripheral class by name classification.
- Connector pinout is inferred from PCB pad-net data.
- A pin map is pad/net-level only when symbol pin names are unavailable.
- Firmware Mode is guidance only and requires datasheet review.

Forbidden claim examples:

- Firmware is ready.
- Pin mapping is guaranteed correct.
- MCU configuration is validated.
- Board bring-up will succeed.
- Schematic matches PCB.
- Electrical validation is complete.
- Production firmware can be generated.
- Full engineering report is generated.

## Recommended Next Architecture Steps

Phase 11 should begin Full Engineering Report. It should consume the existing project, analysis, and firmware manual evidence without adding export workflows unless explicitly authorized.
