# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 6: BOM and Pick-and-Place Parser**. It includes browser-only intake, deterministic classification, KiCad PCB and schematic parser MVPs, plus table-level BOM and placement parsing.

## Current Phase

Phase 6 establishes:

- Browser-side BOM parsing for CSV/TSV/simple delimited text.
- Browser-side pick-and-place / centroid parsing for CSV/TSV/POS/MNT/PNP-style delimited text.
- Spreadsheet recognition for `.xlsx` / `.xls` with clear unsupported messaging.
- Table-level BOM rows, reference designators, quantities, part metadata, supplier fields, and diagnostics.
- Table-level placement rows, coordinates, rotation, side normalization, package/value fields, and diagnostics.
- Normalized project integration with BOM and placement parser status.
- Intake, dashboard, BOM, components, and board summaries for table-level parsed facts.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 6.

## Phase 6 Boundaries

The repository intentionally does not implement:

- Advanced net classification.
- Schematic-to-PCB comparison.
- BOM-to-PCB validation.
- Placement-to-PCB validation.
- Electrical correctness validation.
- Decoupling analysis.
- Pull-up or pull-down analysis.
- Power tree analysis.
- Firmware mapping.
- Full report generation or production exports.

Parsed BOM and placement facts are table-level only. They do not prove PCB agreement, assembly validity, manufacturing package completeness, firmware correctness, or electrical correctness.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
