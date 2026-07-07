# GEBER AI

GEBER AI is an engineering-focused browser application for PCB project intake, parsing, deterministic analysis, firmware guidance, report generation, and client-side exports.

This repository is currently locked at **Phase 12: Export Workflows and Test Hardening**.

## Current Features

- Browser-only file intake and metadata classification.
- KiCad PCB and schematic parser MVPs.
- BOM and pick-and-place table parsers.
- Normalized net inventory and name-based net classification.
- Heuristic decoupling and pull-up/pull-down analysis.
- Heuristic placement and power-tree analysis.
- Firmware Mode guidance from parsed evidence.
- Full structured engineering report generation.
- Client-side Markdown, JSON, and CSV exports.
- Browser print flow for PDF-style output.
- Vitest coverage for deterministic parser, classifier, report, and export behavior.
- ESLint and TypeScript validation.

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

## Validate

```powershell
npm.cmd run build
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd audit --json
```

## Export Limitations

Exports are generated from current parsed data. Unknown values are preserved as `unknown`, `not available`, or empty fields. Browser print/export to PDF is client-side only; server-side PDF generation is not implemented. Excel `.xlsx` export is not implemented.

## Accuracy Rules

GEBER AI does not replace professional PCB review, datasheet review, manufacturing DFM review, or electrical validation.

The application must not claim:

- Production readiness.
- Certification.
- Board validation.
- Manufacturing package validation.
- Completed electrical validation.
- Firmware readiness.
- Completed schematic-to-PCB validation.

See [docs/GEBER_AI_PHASE_ROADMAP.md](docs/GEBER_AI_PHASE_ROADMAP.md) and [docs/PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md).
