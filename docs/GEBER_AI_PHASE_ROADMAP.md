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

Status: Current phase.

Completed scope:

- Added normalized net inventory model.
- Added deterministic name-based net classification.
- Added net evidence from parsed PCB nets, pads, segments, vias, zones, and schematic labels.
- Added informational diagnostics for unknown classification, incomplete differential-pair naming, and source observations.
- Upgraded `/nets` into a searchable/filterable net explorer.
- Added Dashboard, Intake, and Board net inventory summaries.

Explicit exclusions:

- No decoupling capacitor analysis.
- No pull-up or pull-down resistor analysis.
- No power tree analysis.
- No schematic-to-PCB validation.
- No electrical correctness validation.
- No firmware mapping.
- No report generation or export.

## Phase 8: Decoupling and Pull-Up/Pull-Down Analysis

Future phase only.

Expected scope:

- Decoupling analysis.
- Pull-up and pull-down analysis.
- Carefully scoped electrical heuristics with confidence and evidence boundaries.

Phase 8 should not implement firmware mapping, report generation, or exports unless explicitly authorized.
