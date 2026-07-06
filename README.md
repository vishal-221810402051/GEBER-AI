# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, reporting, and export workflows.

This repository is currently locked at **Phase 3: Normalized Project Model**. It includes the React application shell, local multi-file intake, deterministic metadata classification, and a normalized metadata-level project model.

## Current Phase

Phase 3 establishes:

- Browser-only multi-file intake from Phase 2.
- Extension/name-based file classification.
- Category-based completeness scoring.
- A normalized metadata-level PCB project model.
- Parser stage status models.
- Deterministic missing-data warnings based on selected files.
- Metadata-only evidence and assumption separation.
- Dashboard and intake previews powered by the normalized project model.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 3.

## Phase 3 Boundaries

The repository intentionally does not implement:

- KiCad PCB parsing.
- KiCad schematic parsing.
- Gerber, Excellon, IPC-356, EasyEDA, BOM, or pick-and-place parsing.
- Component extraction.
- Net extraction.
- Board geometry extraction.
- Electrical analysis.
- BOM generation.
- Firmware pin mapping.
- Report generation or exports.
- Simulated findings or fake engineering output.

Phase 3 evidence is limited to metadata-level facts such as file name, size, extension, detected category, classification confidence, selected mode, and completeness score.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
