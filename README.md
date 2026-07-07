# GEBER AI

GEBER AI is planned as an engineering-focused web application for PCB project intake, normalization, analysis, firmware guidance, engineering reporting, and export workflows.

This repository is currently locked at **Phase 11: Full Engineering Report**. It includes browser-only intake, KiCad PCB and schematic parser MVPs, BOM and placement table parsers, normalized net inventory, heuristic hardware analysis, Firmware Mode, and a deterministic structured engineering report generated from available evidence.

## Current Phase

Phase 11 establishes:

- Structured engineering report domain models.
- Executive summary generation from parsed project facts and deterministic analysis.
- Risk matrix aggregation from missing-data warnings, parser/net diagnostics, and analysis findings.
- Engineering recommendations tied to concrete missing files or review actions.
- Confidence and missing-data summaries.
- Report sections for files, parser status, board, components, nets, BOM, placement, power, decoupling, bias, firmware, evidence, assumptions, limitations, and appendices.
- `/reports` as the Phase 11 Full Engineering Report page.
- Limited client-side Markdown and JSON downloads clearly marked as Phase 11 limited export.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript validation and creates a production build.
- `npm run typecheck` runs TypeScript validation only.
- `npm run lint` currently aliases TypeScript validation until a linting tool is introduced.
- `npm run test` reports that tests are not configured in Phase 11.

## Phase 11 Boundaries

The repository intentionally does not implement:

- Phase 12 production export workflows.
- Backend persistence.
- Server-side PDF generation.
- Full test framework hardening.
- Full electrical validation.
- Completed schematic-to-PCB validation claims.
- Production readiness claims.

The report is deterministic and evidence-based. It separates parsed facts, inferred findings, heuristic analysis, assumptions, missing data, and limitations.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) for the locked phase sequence.
