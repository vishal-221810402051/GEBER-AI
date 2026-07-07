# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, firmware guidance, reporting, and export workflows.

This repository is currently locked at **Phase 10: Firmware Mode**. It includes browser-only intake, KiCad PCB and schematic parser MVPs, BOM and placement table parsers, normalized net inventory, heuristic hardware analysis, and deterministic firmware guidance from parsed project evidence.

## Current Phase

Phase 10 establishes:

- MCU and programmable IC candidate detection from schematic, PCB, BOM, and role metadata.
- Firmware pin-map entries from schematic symbol pins and/or PCB pad-net evidence.
- Peripheral and bus grouping from net classifications and MCU pin-map evidence.
- Connector pinout summaries from PCB connector pads and net classifications.
- Firmware initialization checklist, driver/module suggestions, bring-up steps, and safety notes.
- `/firmware` as the Phase 10 Firmware Mode manual view.
- Dashboard, Intake, Components, and Nets summaries for firmware guidance.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 10.

## Phase 10 Boundaries

The repository intentionally does not implement:

- Phase 11 full engineering report generation.
- PDF, CSV, Excel, or JSON export workflows.
- Firmware correctness claims.
- Production-ready firmware generation.
- Completed schematic-to-PCB validation.
- Completed electrical validation.

Firmware Mode is guidance only. Datasheet review and board bring-up validation are required before using any mapping in real firmware.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
