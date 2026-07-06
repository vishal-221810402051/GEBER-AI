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

Completed scope:

- Added browser-side `.kicad_pcb` file reading.
- Added layout-level KiCad PCB parser.
- Integrated PCB parser status and layout-level parsed facts into the app.

## Phase 5: KiCad Schematic Parser MVP

Status: Current phase.

Completed scope:

- Added browser-side `.kicad_sch` file reading.
- Added KiCad schematic parser result types.
- Parsed schematic-level metadata, title block, library symbols, schematic symbols, labels, wires, junctions, no-connect markers, and sheets where available.
- Added schematic parser diagnostics and graceful failure behavior.
- Integrated KiCad schematic parser status into the normalized project model.
- Added schematic-level parsed facts to intake, dashboard, component, net, and board views.

Explicit exclusions:

- No BOM parser.
- No pick-and-place parser.
- No Gerber parser.
- No EasyEDA parser.
- No Excellon parser.
- No IPC-356 parser.
- No schematic-to-PCB comparison.
- No electrical analysis.
- No firmware mapping.
- No report generation or export.

## Phase 6: BOM and Pick-and-Place Parser

Future phase only.

Expected scope:

- BOM parser MVP.
- Pick-and-place parser MVP.
- Parser-backed BOM and placement models.
- Clear separation between parsed BOM/placement facts and future validation.

Phase 6 should not implement electrical analysis, firmware mapping, report generation, or exports unless explicitly authorized.
