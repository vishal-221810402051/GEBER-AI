# GEBER AI Architecture

## Phase 8 Architecture Decision

Phase 8 adds a deterministic heuristic analysis layer on top of parsed PCB, schematic, BOM, placement, and Phase 7 net inventory data. The analysis is attached to the normalized project model as `NormalizedPCBProject.analysis`.

No backend routes, persistence, electrical solver, full power tree, regulator margin analysis, thermal analysis, firmware mapping, report generation, or export workflow is introduced in Phase 8.

## Current Structure

```text
src/
|-- domain/
|   |-- analysis.ts
|   `-- nets.ts
|-- features/
|   |-- analysis/
|   |   |-- analysisSummary.ts
|   |   |-- buildBoardAnalysis.ts
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

Phase 8 analysis is deterministic and evidence-based. It uses:

- PCB footprints, pads, pad nets, and footprint coordinates when available.
- Schematic symbols and metadata when available.
- BOM rows and placement rows where available.
- Phase 7 normalized net classifications.

Every Phase 8 finding includes evidence, confidence, limitations, required files for stronger validation, and `fullValidationComplete: false`.

Allowed claims:

- Net inventory built from parsed PCB and schematic metadata.
- Net classified by deterministic name pattern.
- Decoupling or bias evidence found from parsed pad-net topology.
- Missing evidence for likely decoupling or signal bias, with confidence limitations.

Forbidden claim examples:

- Claims that a net is electrically correct.
- Claims that schematic and PCB data agree.
- Claims that a power rail is valid.
- Claims that a pull-up is correct.
- Claims that decoupling is correct or sufficient.
- Claims that firmware mapping is complete.

## Diagnostics Boundary

Diagnostics are evidence statements, not proof of full correctness. Phase 8 may report likely evidence, suspicious distance, missing evidence, or cannot determine states.

## Recommended Next Architecture Steps

Phase 9 should begin placement and power tree analysis. That work should consume Phase 8 evidence without rebranding it as full power integrity or electrical validation.
