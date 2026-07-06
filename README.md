# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 7: Net Explorer and Net Classification**. It includes browser-only intake, KiCad PCB and schematic parser MVPs, BOM and placement table parsers, and a normalized net inventory with deterministic name-based classification.

## Current Phase

Phase 7 establishes:

- Normalized net inventory from parsed PCB layout and schematic label data.
- Name-based net classification for power, ground, buses, debug, reset, enable, analog, motor, GPIO, and unknown nets.
- Net evidence from PCB net declarations, pads, segments, vias, zones, and schematic labels.
- Informational diagnostics for missing cross-source observations, unknown classifications, and incomplete differential-pair naming.
- `/nets` explorer with summary cards, filters, table, and expandable net details.
- Dashboard, Intake, and Board net inventory summaries.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 7.

## Phase 7 Boundaries

The repository intentionally does not implement:

- Electrical correctness validation.
- Schematic-to-PCB validation.
- Decoupling capacitor analysis.
- Pull-up or pull-down resistor analysis.
- Power tree analysis.
- Firmware mapping.
- Report generation or exports.

Net classification is deterministic and name-based. Cross-source observations are informational only and are not validation failures.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
