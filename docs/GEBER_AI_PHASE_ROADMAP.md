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

Status: Current phase.

Completed scope:

- Added browser-side BOM parsing for CSV/TSV/simple delimited text.
- Added browser-side pick-and-place / centroid parsing for common delimited table files.
- Added shared delimited-text parser with quote and delimiter handling.
- Added spreadsheet recognition with unsupported Phase 6 messaging.
- Integrated BOM and placement parser status into the normalized project model.
- Added table-level BOM and placement evidence.
- Added BOM, intake, dashboard, components, and board UI surfaces for parsed table facts.

Explicit exclusions:

- No advanced net classification.
- No schematic-to-PCB comparison.
- No BOM-to-PCB validation.
- No placement-to-PCB validation.
- No electrical analysis.
- No firmware mapping.
- No full report generation or export.

## Phase 7: Net Explorer and Net Classification

Future phase only.

Expected scope:

- Net explorer expansion.
- Basic net classification.
- Clear separation between parsed net facts and inferred classification.

Phase 7 should not implement electrical correctness validation, firmware mapping, report generation, or production exports unless explicitly authorized.
