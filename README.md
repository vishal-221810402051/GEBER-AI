# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 2: File Upload and File Classification**. It includes the React application shell from Phase 1 plus client-side multi-file intake and deterministic metadata classification.

## Current Phase

Phase 2 establishes:

- React + TypeScript + Vite frontend foundation.
- React Router route structure.
- Local browser-only multi-file intake on `/intake`.
- Drag-and-drop and standard file picker selection.
- Selected file list, removal, clear-all controls, file count, and total size.
- Extension/name-based file classification.
- Category-based completeness scoring.
- Basic, Analyze, and Firmware mode selection without running analysis.
- Dashboard summary from in-memory intake metadata only.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 2.

## Phase 2 Boundaries

The repository intentionally does not implement:

- Backend upload or persistence.
- Zip content inspection.
- KiCad, EasyEDA, Gerber, Excellon, BOM, pick-and-place, netlist, schematic, firmware, or report parsing.
- Normalized PCB project extraction.
- Component extraction.
- Net extraction.
- Electrical analysis.
- BOM generation.
- Firmware pin mapping.
- Report generation or exports.
- Simulated findings or fake engineering output.

Phase 2 classification is based only on browser file metadata such as file name, extension, size, and MIME type when available.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
