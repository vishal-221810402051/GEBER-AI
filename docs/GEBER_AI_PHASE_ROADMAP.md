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

Status: Current phase.

Completed scope:

- Added firmware domain models.
- Added MCU and programmable IC candidate detection.
- Added firmware pin mapping from schematic symbol pins and PCB pad-net evidence.
- Added peripheral and bus map generation.
- Added connector pinout summaries.
- Added firmware initialization checklist, driver suggestions, safety notes, and bring-up steps.
- Upgraded `/firmware` into the Phase 10 Firmware Mode manual view.
- Added firmware summaries to Dashboard, Intake, Components, and Nets.

Explicit exclusions:

- No Phase 11 full engineering report generation.
- No PDF, CSV, Excel, or JSON export workflow.
- No firmware correctness claim.
- No production-ready firmware generation.
- No completed schematic-to-PCB validation claim.
- No completed electrical validation claim.

## Phase 11: Full Engineering Report

Future phase only.

Expected scope:

- Full engineering report model and UI built from existing evidence.
- Clear distinction between parsed facts, inferred findings, limitations, and recommended next actions.

Phase 11 should not implement export workflows unless explicitly authorized.
