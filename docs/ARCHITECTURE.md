# GEBER AI Architecture

## Phase 11 Architecture Decision

Phase 11 adds a deterministic full engineering report layer on top of the normalized project, parser status, net inventory, hardware analysis, power-tree analysis, and Firmware Mode manual. The report is attached to `NormalizedPCBProject.report.engineeringReport`.

No backend persistence, server-side PDF generation, production export workflow, unsupported validation claim, full electrical validation, schematic-to-PCB validation claim, or production readiness claim is introduced in Phase 11.

## Current Structure

```text
src/
|-- domain/
|   |-- report.ts
|   |-- firmware.ts
|   |-- analysis.ts
|   |-- placement.ts
|   |-- power.ts
|   `-- nets.ts
|-- features/
|   |-- report/
|   |-- firmware/
|   |-- analysis/
|   |-- net-explorer/
|   |-- parsers/
|   `-- project-model/
|-- pages/
`-- styles/
```

## Report Boundary

The Phase 11 report uses:

- Uploaded file metadata and classification.
- Completeness score and readiness label.
- Parser status and diagnostics.
- Missing-data warnings.
- Parsed KiCad PCB, schematic, BOM, and pick-and-place data.
- Net inventory and name-based classification.
- Decoupling and pull-up/pull-down analysis.
- Placement and power-tree analysis.
- Firmware Mode manual.

The report clearly separates directly parsed facts, inferred findings, heuristic analysis, assumptions, missing data, and limitations.

Allowed claims:

- Report generated from parsed project files and deterministic analysis results.
- Risk matrix aggregates parser diagnostics, missing-data warnings, and analysis findings.
- Recommendation is based on missing schematic file.
- Power budget confidence is limited because current values are missing.
- Firmware mapping requires datasheet review.

Forbidden claim examples:

- Board validated.
- Design passed.
- Ready for production.
- Firmware ready.
- Power integrity verified.
- Manufacturing package validated.
- Schematic-to-PCB match confirmed.
- Full electrical validation complete.

## Recommended Next Architecture Steps

Phase 12 should begin production export workflows and test hardening. It should preserve the Phase 11 evidence boundaries and avoid turning limited client-side downloads into production export claims without explicit implementation.
