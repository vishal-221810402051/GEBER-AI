# GEBER AI

GEBER AI is planned as an engineering-focused TypeScript web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 0: Repository Diagnosis and Architecture Lock**. It does not yet include upload flows, parsers, dashboards, BOM tooling, firmware mode, report generation, or analysis engines.

## Current Phase

Phase 0 establishes the project foundation only:

- Minimal Vite + TypeScript web app scaffold.
- Strict TypeScript configuration.
- Initial domain model contracts for future PCB project data.
- Architecture and phase roadmap documentation.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 0.

## Phase 0 Boundaries

The repository intentionally does not implement:

- File upload.
- KiCad, EasyEDA, Gerber, Excellon, BOM, placement, or firmware parsing.
- PCB analysis engines.
- Simulated findings or fake engineering output.
- UI shell, dashboard, report views, or export workflows.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
