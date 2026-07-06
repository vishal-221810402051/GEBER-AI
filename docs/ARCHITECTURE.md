# GEBER AI Architecture

## Phase 7 Architecture Decision

Phase 7 adds a deterministic net explorer layer on top of parsed PCB and schematic data. The feature builds a normalized net inventory and classifies net names with explicit confidence and evidence.

No backend routes, persistence, electrical solver, schematic-to-PCB validation, firmware mapping, report generation, or export workflow is introduced in Phase 7.

## Current Structure

```text
src/
|-- domain/
|   `-- nets.ts
|-- features/
|   |-- net-explorer/
|   |   |-- buildNetDiagnostics.ts
|   |   |-- buildNetInventory.ts
|   |   |-- classifyNet.ts
|   |   |-- netExplorerTypes.ts
|   |   |-- netPatterns.ts
|   |   `-- summarizeNetInventory.ts
|   |-- parsers/
|   `-- project-model/
|-- pages/
`-- styles/
```

## Net Classification Boundary

Phase 7 classification is name-based only. It uses deterministic patterns for categories such as Power, Ground, I2C, SPI, UART, USB, CAN, Reset, Enable, Programming/debug, Analog, Motor control, GPIO, and Unknown.

Allowed claims:

- Net inventory built from parsed PCB and schematic metadata.
- Net classified by name pattern.
- Electrical validation is not implemented.

Forbidden claim examples:

- Claims that a net is electrically correct.
- Claims that schematic and PCB data agree.
- Claims that a power rail is valid.
- Claims that a pull-up exists.
- Claims that decoupling is sufficient.
- Claims that firmware mapping is complete.

## Diagnostics Boundary

Diagnostics are informational unless explicitly marked otherwise. Cross-source observations use language such as “name not observed in both sources” and “not a validation failure.”

## Recommended Next Architecture Steps

Phase 8 should begin decoupling and pull-up/pull-down analysis. That work should keep heuristic findings separate from parsed facts and include confidence, evidence, and limitations.
