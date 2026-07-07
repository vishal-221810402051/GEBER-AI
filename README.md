# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 8: Decoupling and Pull-Up/Pull-Down Analysis**. It includes browser-only intake, KiCad PCB and schematic parser MVPs, BOM and placement table parsers, a normalized net inventory, and deterministic heuristic analysis for decoupling and signal bias evidence.

## Current Phase

Phase 8 establishes:

- Strongly typed Phase 8 analysis models in `src/domain/analysis.ts`.
- Deterministic component role classification from reference designators, values, footprints, schematic metadata, and BOM metadata.
- Power and ground net identification using Phase 7 net classification first, with Phase 8 name heuristics as supporting evidence.
- Decoupling capacitor candidates from parsed PCB pad-net evidence.
- IC power/ground pad review and heuristic decoupling coverage states.
- Pull-up and pull-down resistor candidates from resistor pad-net topology.
- Bias requirement heuristics for I2C, reset, enable, boot/strap, chip-select, fault, interrupt, and alert style nets.
- Dashboard, Intake, Components, Nets, and Power preview surfaces for Phase 8 evidence.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 8.

## Phase 8 Boundaries

The repository intentionally does not implement:

- Electrical correctness validation.
- Schematic-to-PCB validation.
- Power tree analysis.
- Regulator margin analysis.
- Thermal analysis.
- Firmware mapping.
- Report generation or exports.

Phase 8 findings are deterministic, heuristic, and evidence-based. They include evidence, confidence, limitations, and required files for stronger validation. They do not prove that decoupling, pull-ups, pull-downs, or the board are electrically correct.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
