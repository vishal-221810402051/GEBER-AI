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

Status: Current phase.

Completed scope:

- Migrated the frontend foundation to React + TypeScript + Vite.
- Added React Router route structure.
- Added the base application layout.
- Added top navigation and side navigation.
- Added landing, intake, dashboard, board, components, nets, power, BOM, firmware, and reports pages.
- Added non-functional intake planning content.
- Marked future capabilities as planned, not implemented, missing data, or future phase.

Explicit exclusions:

- No real upload.
- No file classification.
- No parsers.
- No analysis engines.
- No real dashboard metrics.
- No fake PCB findings.
- No BOM generation.
- No firmware report generation.
- No report export.

## Phase 2: File Upload and File Classification

Future phase only.

Expected scope:

- Upload handling.
- Project package intake.
- File type detection.
- File completeness metadata.
- Source file classification state.

## Phase 3: Parsing and Normalization

Future phase only.

Expected scope:

- Real parsers for supported file types.
- Normalization into the domain model.
- Parser diagnostics.

## Phase 4: PCB Analysis Engines

Future phase only.

Expected scope:

- Connectivity checks.
- Manufacturing checks.
- BOM and placement checks.
- Power rail checks.
- Firmware pin map checks.

## Phase 5: Reporting and Export

Future phase only.

Expected scope:

- Engineering report generation.
- Export formats.
- Traceable issue summaries.

## Phase 6: Workflow Hardening

Future phase only.

Expected scope:

- Tests around real parsers and analysis engines.
- Performance work.
- Error handling.
- Security and privacy review.
