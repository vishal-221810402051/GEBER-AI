# GEBER AI Phase Roadmap

## Phase 0: Repository Diagnosis and Architecture Lock

Status: Complete.

## Phase 1: Application Shell and Intake Planning

Status: Complete.

## Phase 2: File Upload and File Classification

Status: Complete.

## Phase 3: Normalized Project Model

Status: Complete.

Completed scope:

- Added normalized metadata-level project model.
- Added parser stages as status models only.
- Added deterministic missing-data warnings based on selected files.
- Added metadata-only evidence and assumptions.

## Phase 4: KiCad PCB Parser MVP

Status: Current phase.

Completed scope:

- Added browser-side `.kicad_pcb` file reading.
- Added lightweight KiCad S-expression parser.
- Added KiCad PCB parser result types.
- Parsed layout-level metadata, layers, nets, footprints, pads, track segments, vias, zones, and Edge.Cuts outline primitives where available.
- Added approximate board bounding box from Edge.Cuts primitives when possible.
- Added parser diagnostics and graceful failure behavior.
- Integrated KiCad PCB parser status into the normalized project model.
- Added layout-level parsed facts to intake, dashboard, board, footprint, and net views.

Explicit exclusions:

- No KiCad schematic parser.
- No Gerber parser.
- No EasyEDA parser.
- No Excellon parser.
- No IPC-356 parser.
- No BOM parser.
- No pick-and-place parser.
- No schematic-to-PCB comparison.
- No electrical analysis.
- No firmware mapping.
- No report generation or export.

## Phase 5: KiCad Schematic Parser MVP

Future phase only.

Expected scope:

- KiCad schematic parser MVP.
- Schematic-level symbols and net intent where available.
- Parser-backed schematic model population.
- Careful comparison boundaries with PCB layout data.

Phase 5 should not implement unrelated parser families, electrical analysis engines, firmware mapping, or exports unless explicitly authorized.
