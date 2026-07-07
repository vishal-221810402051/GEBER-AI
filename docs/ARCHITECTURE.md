# GEBER AI Architecture

## Phase 12 Architecture Decision

Phase 12 hardens the existing frontend MVP with deterministic client-side exports, real test tooling, ESLint, error boundaries, and documentation. It does not add a backend, authentication, persistence, cloud storage, AI generation, new parser categories, or new analysis phases.

## Current Structure

```text
src/
|-- components/
|   `-- errors/
|-- domain/
|   |-- report.ts
|   |-- firmware.ts
|   |-- analysis.ts
|   |-- placement.ts
|   |-- power.ts
|   `-- nets.ts
|-- features/
|   |-- export/
|   |-- report/
|   |-- firmware/
|   |-- analysis/
|   |-- net-explorer/
|   |-- parsers/
|   `-- project-model/
|-- pages/
|-- styles/
`-- test/
```

## Export Boundary

Exports are local browser operations. Supported Phase 12 exports include:

- Engineering report Markdown and JSON.
- Browser print/save-as-PDF flow.
- BOM CSV and JSON.
- Net inventory CSV and JSON.
- Component summary CSV.
- Placement summary and placement findings CSV.
- Power rails and power budget CSV.
- Risk matrix, recommendations, and missing-data CSV.

Unknown values remain unknown. Exported data is not a validation certificate.

## Test and Lint Boundary

Vitest covers deterministic parser, classifier, report, and CSV export behavior with synthetic fixtures only. ESLint is intentionally simple and paired with TypeScript validation.

## Privacy Model

Processing is client-side in the browser session. No backend storage, authentication, cloud upload, or database is implemented.

## Accuracy Boundary

GEBER AI does not replace professional PCB review, datasheet review, manufacturing DFM review, or electrical validation.

Forbidden claims remain:

- Production ready.
- Certified.
- Board validated.
- Manufacturing package validated.
- Electrical validation complete.
- Firmware ready.
- Schematic-to-PCB match confirmed.

## Future Hardening

Phase 12.1 should lock the Git baseline and perform an MVP review. Future work may add broader fixtures, stronger UI regression checks, and production export workflows only when explicitly authorized.
