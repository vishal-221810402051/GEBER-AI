# GEBER AI Phase Roadmap

## Phase 0: Repository Diagnosis and Architecture Lock

Status: Complete.

Completed scope:

- Inspected the repository state.
- Established the minimum professional TypeScript web app foundation.
- Documented the architecture and phase boundaries.
- Defined core domain contracts without feature behavior.
- Validated the foundation with available commands.

## Phase 1: Application Shell and Intake Planning

Status: Complete.

Completed scope:

- Migrated the frontend foundation to React + TypeScript + Vite.
- Added React Router route structure.
- Added the base application layout.
- Added navigation and placeholder pages.

## Phase 2: File Upload and File Classification

Status: Complete.

Completed scope:

- Added client-side multi-file intake.
- Added deterministic file classification by extension and filename pattern.
- Added classification confidence labels.
- Added category-based completeness scoring.
- Added analysis mode selection without running analysis.

## Phase 3: Normalized Project Model

Status: Current phase.

Completed scope:

- Added normalized metadata-level project model.
- Added parser stages as status models only.
- Added deterministic missing-data warnings based on selected files.
- Added metadata-only evidence and assumptions.
- Added normalized project preview to intake.
- Added normalized project metadata summary to dashboard.

Explicit exclusions:

- No content parsing.
- No KiCad PCB parser.
- No KiCad schematic parser.
- No Gerber, Excellon, IPC-356, EasyEDA, BOM, or placement parser.
- No component, net, pad, track, via, BOM row, firmware pin, or report extraction.
- No electrical analysis.
- No fake findings.

## Phase 4: KiCad PCB Parser MVP

Future phase only.

Expected scope:

- KiCad PCB parser MVP.
- Parser-backed board model population.
- Parser status integration with real parser results.
- Clear parser diagnostics and missing-data warnings.

Phase 4 should not implement unrelated parser families or analysis engines unless explicitly authorized.

## Phase 5: Additional Parsers and Normalization

Future phase only.

Expected scope:

- KiCad schematic parser.
- Gerber and Excellon parser support.
- BOM and placement parser support.
- Normalization refinements.

## Phase 6: PCB Analysis Engines

Future phase only.

Expected scope:

- Connectivity checks.
- Manufacturing checks.
- BOM and placement checks.
- Power rail checks.
- Firmware pin map checks.

## Phase 7: Reporting and Export

Future phase only.

Expected scope:

- Engineering report generation.
- Export formats.
- Traceable issue summaries.

## Phase 8: Workflow Hardening

Future phase only.

Expected scope:

- Tests around real parsers and analysis engines.
- Performance work.
- Error handling.
- Security and privacy review.
