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

Completed scope:

- Added strongly typed Phase 8 analysis models.
- Added deterministic component role classification.
- Added power and ground net identification using Phase 7 classifications first.
- Added decoupling capacitor candidate detection from parsed pad-net evidence.
- Added IC power/ground pad review and heuristic decoupling coverage states.
- Added pull-up and pull-down resistor candidate detection from resistor pad-net topology.

## Phase 9: Placement and Power Tree Analysis

Status: Current phase.

Completed scope:

- Added placement analysis domain models.
- Added power tree analysis domain models.
- Added normalized placement records from PCB footprint and pick-and-place evidence.
- Added heuristic proximity checks for decoupling, regulator capacitors, crystals, connectors, and crowded origins.
- Added power input, protection, and regulator candidate detection.
- Added power rail models and power budget evidence with unknown-current handling.
- Updated Dashboard, Intake, Board, Components, and Power pages for Phase 9 evidence.

Explicit exclusions:

- No Firmware Mode.
- No MCU firmware pin mapping.
- No full engineering report generation.
- No PDF, CSV, Excel, or JSON export workflow.
- No production readiness claims.
- No full manufacturing validation.
- No full electrical validation.
- No regulator sizing, thermal margin, or datasheet correctness validation.

## Phase 10: Firmware Mode

Future phase only.

Expected scope:

- Firmware-oriented analysis mode and pin evidence workflows.
- Careful firmware mapping confidence based on schematic, PCB, and net evidence.

Phase 10 should not implement final report/export workflows unless explicitly authorized.
