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
- Added top navigation and side navigation.
- Added landing, intake, dashboard, board, components, nets, power, BOM, firmware, and reports pages.
- Added non-functional intake planning content.
- Marked future capabilities as planned, not implemented, missing data, or future phase.

## Phase 2: File Upload and File Classification

Status: Current phase.

Completed scope:

- Added client-side multi-file intake.
- Added drag-and-drop and standard file picker selection.
- Added selected file list, remove file, and clear all controls.
- Added deterministic file classification by extension and filename pattern.
- Added classification confidence labels.
- Added category-based completeness scoring.
- Added analysis mode selection without running analysis.
- Added intake summary warnings for Gerber-only packages and firmware reliability.
- Added dashboard intake metadata summary from local React state.

Explicit exclusions:

- No backend upload.
- No file persistence.
- No zip content inspection.
- No content parsing.
- No normalized PCB project model.
- No extracted components, nets, layers, pads, tracks, vias, or BOM data.
- No analysis engines.
- No firmware report generation.
- No report export.
- No fake PCB findings.

## Phase 3: Normalized Project Model

Future phase only.

Expected scope:

- Normalized project model.
- Parser status system.
- Confidence system integration.
- Missing-data warning model.
- Preparation for future parser outputs.

Phase 3 should not claim real parser support unless actual parsers are explicitly implemented and validated.

## Phase 4: Parsing and Normalization

Future phase only.

Expected scope:

- Real parsers for supported file types.
- Normalization into the domain model.
- Parser diagnostics.

## Phase 5: PCB Analysis Engines

Future phase only.

Expected scope:

- Connectivity checks.
- Manufacturing checks.
- BOM and placement checks.
- Power rail checks.
- Firmware pin map checks.

## Phase 6: Reporting and Export

Future phase only.

Expected scope:

- Engineering report generation.
- Export formats.
- Traceable issue summaries.

## Phase 7: Workflow Hardening

Future phase only.

Expected scope:

- Tests around real parsers and analysis engines.
- Performance work.
- Error handling.
- Security and privacy review.
