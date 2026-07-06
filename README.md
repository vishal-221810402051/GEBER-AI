# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 4: KiCad PCB Parser MVP**. It includes browser-only intake, deterministic file classification, a normalized project model, and a layout-level `.kicad_pcb` parser.

## Current Phase

Phase 4 establishes:

- Browser-side reading of selected `.kicad_pcb` files.
- A lightweight KiCad S-expression parser.
- Layout-level KiCad PCB extraction for metadata, layers, nets, footprints, pads, segments, vias, zones, and Edge.Cuts outline primitives where available.
- Parser diagnostics for empty files, invalid S-expressions, missing top-level forms, missing sections, large files, and partial parse conditions.
- Normalized project integration with KiCad PCB parser status.
- Intake, dashboard, board, footprint, and net views powered by parsed layout facts.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 4.

## Phase 4 Boundaries

The repository intentionally does not implement:

- KiCad schematic parsing.
- Gerber, Excellon, IPC-356, EasyEDA, BOM, or pick-and-place parsing.
- Schematic-to-PCB comparison.
- Electrical correctness checks.
- Decoupling analysis.
- Pull-up or pull-down analysis.
- Power tree analysis.
- Firmware mapping.
- Report generation or exports.

Parsed KiCad PCB facts are layout-level only. They do not prove schematic agreement, manufacturing validity, firmware correctness, BOM completeness, or electrical correctness.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
