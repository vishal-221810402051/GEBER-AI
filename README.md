# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 1: Application Shell and Intake Planning**. It includes the base React application shell, navigation, placeholder pages, and a non-functional intake planning surface.

## Current Phase

Phase 1 establishes:

- React + TypeScript + Vite frontend foundation.
- React Router route structure.
- Main app layout with top navigation and side navigation.
- Landing page and future-workspace placeholder pages.
- Intake planning surface for the future upload and classification workflow.
- Clear notices for planned, not implemented, missing-data, and future-phase functionality.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 1.

## Phase 1 Boundaries

The repository intentionally does not implement:

- Real file upload.
- File classification.
- KiCad, EasyEDA, Gerber, Excellon, BOM, pick-and-place, netlist, or firmware parsing.
- PCB analysis engines.
- Simulated findings or fake engineering output.
- Real dashboards, BOMs, firmware pin maps, reports, or exports.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
