# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 5: KiCad Schematic Parser MVP**. It includes browser-only intake, deterministic file classification, a normalized project model, a layout-level `.kicad_pcb` parser, and a schematic-level `.kicad_sch` parser.

## Current Phase

Phase 5 establishes:

- Browser-side reading of selected `.kicad_sch` files.
- KiCad schematic S-expression parsing using existing parser utilities.
- Schematic-level extraction for metadata, title blocks, library symbols, symbol instances, properties, labels, wires, junctions, no-connect markers, and sheets where available.
- Parser diagnostics for empty files, invalid S-expressions, missing top-level forms, missing sections, and partial parse conditions.
- Normalized project integration with KiCad schematic parser status.
- Intake, dashboard, components, nets, and board notices powered by parsed schematic facts.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 5.

## Phase 5 Boundaries

The repository intentionally does not implement:

- BOM parsing.
- Pick-and-place parsing.
- Gerber, Excellon, IPC-356, or EasyEDA parsing.
- Schematic-to-PCB comparison.
- Electrical correctness validation.
- Decoupling analysis.
- Pull-up or pull-down analysis.
- Power tree analysis.
- Firmware mapping.
- Report generation or exports.

Parsed schematic facts are schematic-level only. They do not prove PCB agreement, electrical correctness, firmware mapping, BOM completeness, or manufacturing validity.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
