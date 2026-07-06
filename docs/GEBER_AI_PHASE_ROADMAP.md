# GEBER AI Phase Roadmap

## Phase 0: Repository Diagnosis and Architecture Lock

Status: Current phase.

Goals:

- Inspect the repository state.
- Establish the minimum professional TypeScript web app foundation.
- Document the architecture and phase boundaries.
- Define core domain contracts without implementing feature behavior.
- Validate the foundation with available commands.

Explicit exclusions:

- No UI shell.
- No uploads.
- No parsers.
- No dashboard.
- No BOM workflow.
- No firmware mode.
- No reports.
- No analysis engines.
- No simulated or fabricated engineering findings.

## Phase 1: Application Shell and Intake Planning

Future phase only.

Expected scope:

- Establish routing and layout.
- Add non-functional intake surfaces.
- Define user-facing navigation for future workflows.

Phase 1 must not claim parsing or analysis capability unless those features are separately implemented and validated.

## Phase 2: File Upload and Project Intake

Future phase only.

Expected scope:

- Upload handling.
- Project creation workflow.
- Source file classification metadata.
- Storage strategy.

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
