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

Completed scope:

- Added normalized net inventory model.
- Added deterministic name-based net classification.
- Added net evidence from parsed PCB nets, pads, segments, vias, zones, and schematic labels.
- Added informational diagnostics for unknown classification, incomplete differential-pair naming, and source observations.
- Upgraded `/nets` into a searchable/filterable net explorer.
- Added Dashboard, Intake, and Board net inventory summaries.

## Phase 8: Decoupling and Pull-Up/Pull-Down Analysis

Status: Current phase.

Completed scope:

- Added strongly typed Phase 8 analysis models.
- Added deterministic component role classification.
- Added power and ground net identification using Phase 7 classifications first.
- Added decoupling capacitor candidate detection from parsed pad-net evidence.
- Added IC power/ground pad review and heuristic decoupling coverage states.
- Added pull-up and pull-down resistor candidate detection from resistor pad-net topology.
- Added cautious bias requirement heuristics for I2C, reset, enable, boot/strap, chip-select, fault, interrupt, and alert style nets.
- Added Phase 8 summaries to Dashboard, Intake, Components, Nets, and Power preview pages.

Explicit exclusions:

- No full electrical correctness validation.
- No full power tree analysis.
- No regulator margin analysis.
- No thermal analysis.
- No schematic-to-PCB validation.
- No firmware mapping.
- No report generation or export.

## Phase 9: Placement and Power Tree Analysis

Future phase only.

Expected scope:

- Placement-aware evidence review.
- Power tree analysis built from parsed nets and component evidence.
- Continued confidence and limitation reporting.

Phase 9 should not implement firmware mapping, report generation, or exports unless explicitly authorized.
