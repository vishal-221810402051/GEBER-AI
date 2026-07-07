# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 9: Placement and Power Tree Analysis**. It includes browser-only intake, KiCad PCB and schematic parser MVPs, BOM and placement table parsers, normalized net inventory, Phase 8 decoupling and pull-resistor heuristics, and Phase 9 placement and power-tree evidence analysis.

## Current Phase

Phase 9 establishes:

- Normalized placement component records from PCB footprints and pick-and-place rows.
- Heuristic placement proximity checks for decoupling capacitors, regulator capacitors, crystals, connectors, and crowded origins.
- Placement findings with evidence, confidence, limitations, and missing data requirements.
- Power input, protection, and voltage regulator candidates from component roles, names, nets, and PCB connectivity.
- Power rail models from Phase 7 net classifications and parsed PCB pad/track/via/zone evidence.
- Power budget evidence tables where current is `unknown` unless explicitly present in parsed BOM fields.
- Dashboard, Intake, Board, Components, and Power page updates for Phase 9 evidence.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 9.

## Phase 9 Boundaries

The repository intentionally does not implement:

- Firmware Mode or MCU firmware pin mapping.
- Full engineering report generation.
- PDF, CSV, Excel, or JSON export workflows.
- Production readiness claims.
- Full manufacturing validation.
- Full electrical validation.
- Regulator sizing validation, thermal margin validation, or datasheet correctness validation.

Phase 9 findings are deterministic, heuristic, and evidence-based. They do not prove placement is correct, assembly is validated, the power design is valid, or the board is production-ready.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
