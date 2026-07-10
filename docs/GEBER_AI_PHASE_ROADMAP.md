# GEBER AI Phase Roadmap

## Phase 0: Repository Diagnosis and Architecture Lock

Status: Complete.

## Phase 1: Application Shell and Intake Planning

Status: Complete.

## Phase 2: File Upload and File Classification

Status: Complete.

## Phase 3: Normalized Project Model

Status: Complete.

## Phase 4: KiCad PCB Parser MVP

Status: Complete.

## Phase 5: KiCad Schematic Parser MVP

Status: Complete.

## Phase 6: BOM and Pick-and-Place Parser

Status: Complete.

## Phase 7: Net Explorer and Net Classification

Status: Complete.

## Phase 8: Decoupling and Pull-Up/Pull-Down Analysis

Status: Complete.

## Phase 9: Placement and Power Tree Analysis

Status: Complete.

## Phase 10: Firmware Mode

Status: Complete.

## Phase 11: Full Engineering Report

Status: Complete.

## Phase 12: Export Workflows and Test Hardening

Status: Complete.

Completed scope:

- Added deterministic client-side export helpers.
- Added report, BOM, net, component, placement, power, risk, recommendation, and missing-data exports.
- Added browser print/save-as-PDF flow for report viewing.
- Added Vitest test framework and focused deterministic tests.
- Added ESLint setup.
- Added app-level error boundary.
- Added print styling and export UI polish.
- Added MVP readiness documentation.

Explicit exclusions:

- No new analysis phase.
- No backend persistence.
- No authentication.
- No cloud storage.
- No AI/LLM report generation.
- No production certification claim.
- No full electrical validation claim.
- No manufacturing validation claim.

## Phase 12.1: Git Baseline Lock and MVP Review

Future phase only.

Expected scope:

- Review final working tree.
- Commit and tag a clean MVP baseline if authorized.
- Perform manual MVP acceptance review.

## Frontend Phase A: UI/UX Diagnosis and Intake Redesign Lock

Status: Complete.

Completed scope:

- Diagnosed shell, navigation, intake, dashboard, result pages, reports, firmware, and visual density.
- Locked the frontend redesign sequence.

## Frontend Phase B: Simplified App Shell and Navigation

Status: Complete.

Completed scope:

- Cleaned shell navigation and stale status language.
- Established the premium dark engineering dashboard visual direction.
- Kept full intake redesign reserved for Frontend Phase C.

## Frontend Phase C: Intake Upload Workspace Redesign

Status: Complete.

Completed scope:

- Redesigned `/intake` around upload-first project package intake.
- Added grouped file inventory with compact per-file parser status.
- Shows multiple schematic files independently when available.
- Collapsed parser diagnostics, warnings, direct evidence, and assumptions by default.

Explicit exclusions:

- No parser algorithm changes.
- No normalized project model reshape.
- No backend upload or persistence.
- No schematic-to-PCB validation claim.

## Frontend Phase D: Results Pages Simplification

Future phase only.

Expected scope:

- Simplify Dashboard, Board, Components, Nets, Power, and BOM presentation.
- Reduce repeated warnings and dense always-open details.
- Preserve all evidence and validation caveats.

## Architecture Phase A: Workflow, Backend, AI, Loading UX, and Glass UI Investigation

Status: Complete.

Completed scope:

- Diagnosed the local-first workflow, frontend/backend boundary, AI fit, loading gaps, and alert/error gaps.
- Recommended keeping Architecture Phase B frontend-only before backend or AI work.

## Architecture Phase B: Loading, Alert, and Glass UI System

Status: Complete.

Scope:

- Add reusable glass alert, status card, loading, progress, overlay, and pipeline components.
- Visualize intake parser/readiness status from deterministic local state.
- Keep backend, OpenAI, persistence, parser, analysis, firmware, report, and export work deferred.

## Architecture Phase C: Processing Pipeline UX Integration

Status: Complete.

Scope:

- Integrate processing pipeline UX into intake.
- Derive processing states from deterministic local file, parser, normalized model, analysis, firmware, and report state.
- Keep backend, OpenAI, persistence, parser, analysis, firmware, report, and export work deferred.

## Architecture Phase D: Backend Foundation Investigation-to-Implementation

Status: Complete.

Scope:

- Add lightweight Node.js and TypeScript backend foundation.
- Add health and capabilities endpoints.
- Add local CORS, environment loading, request limits, error response shape, and secret guardrails.
- Keep OpenAI, AI review, uploads, persistence, authentication, parser, analysis, firmware, report, and export work deferred.

## Architecture Phase E: AI Review Prototype

Status: Complete.

Scope:

- Add server-side AI review endpoint.
- Add structured evidence-only request and response contracts.
- Add deterministic AI input builder from normalized project/report evidence.
- Add consent-gated Reports page AI review panel.
- Keep API key handling server-side only.
- Keep deterministic frontend evidence as the source of truth.

## Architecture Phase F: AI Review UX Polish and Smart Review Workspace Investigation

Status: Complete.

Scope:

- Polish the Reports page AI Review panel with explicit report, backend, configuration, consent, running, success, and error states.
- Add a compact structured evidence package summary before consent.
- Keep backend capability checks graceful and manual re-checking available.
- Improve AI Review result presentation without treating AI output as validation.
- Investigate a future smart review workspace.
- Do not add chat or streaming unless explicitly approved.
- Keep deterministic frontend evidence as the source of truth.

## Architecture Phase G: Smart Review Workspace Implementation

Superseded on `main` by Product Realignment.

Expected scope:

- Add a guided `/review` workspace as the primary post-intake review surface.
- Reuse deterministic report evidence, risks, recommendations, missing-data warnings, firmware readiness, and AI Review UX.
- Keep Board, Components, Nets, Power, and BOM routes available as advanced evidence pages.
- Do not add chat, streaming, persistence, authentication, raw backend file upload, parser changes, analysis engine changes, report generation changes, or normalized project reshaping unless explicitly approved.

## Product Realignment Phase A: Actual MVP Workflow and Repository Simplification Investigation

Status: Complete.

Completed scope:

- Investigated the repository against the intended MVP workflow.
- Confirmed that Gerber, drill, IPC-356, ZIP, EasyEDA, and KiCad project files are detection or metadata only.
- Confirmed that KiCad schematic, KiCad PCB, BOM CSV/TSV, and pick-and-place CSV/TSV are the current real parser set.
- Defined the final route direction: `/`, `/processing`, and `/result`, with advanced evidence routes kept internal or secondary.
- Locked the Product Realignment implementation sequence.

## Product Realignment Phase B: Single Landing and Upload Workflow

Status: Complete.

Completed scope:

- Made `/` the primary user-facing upload and mode-selection workflow.
- Exposed only Inspect / Analysis and Firmware as public mode choices.
- Added a temporary public-to-internal mode adapter: Inspect maps to existing internal `analyze`, Firmware maps to existing internal `firmware`.
- Kept `/intake` as compatibility redirect to `/`.
- Simplified primary navigation to Home while preserving advanced routes for direct access.
- Reused the existing shared file intake state and upload pipeline without duplicating file reads.
- Kept Gerber, drill, IPC-356, ZIP, EasyEDA, and KiCad project capability language honest as detection or metadata only.

Explicit exclusions:

- No final two-mode orchestrator.
- No `/processing` route.
- No `/result` route.
- No Gerber, ZIP, Excellon, Gerber X2, or IPC-356 parsing.
- No parser, analysis, firmware, report, backend, AI, or normalized model changes.

## Product Realignment Phase C: Two-Mode Orchestrator

Future phase only.

Expected scope:

- Replace the temporary internal `basic | analyze | firmware` ambiguity with `inspect | firmware`.
- Introduce a deterministic mode workflow contract.
- Keep parser algorithms, report generation, firmware generation, and normalized project shape stable unless explicitly approved.
