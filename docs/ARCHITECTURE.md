# GEBER AI Architecture

## Phase 2 Architecture Decision

Phase 2 keeps the React + TypeScript + Vite application from Phase 1 and adds a browser-only file intake feature. Files are stored in local React state for the current session. Classification is deterministic and based only on file metadata such as name, extension, size, and MIME type when available.

No backend routes, parser services, normalized PCB project extraction, analysis engines, report generation, firmware workflows, or export workflows are introduced in Phase 2.

## Current Structure

```text
.
|-- docs/
|   |-- ARCHITECTURE.md
|   `-- GEBER_AI_PHASE_ROADMAP.md
|-- src/
|   |-- app/
|   |   |-- App.tsx
|   |   `-- routes.tsx
|   |-- components/
|   |   |-- cards/
|   |   |-- layout/
|   |   `-- status/
|   |-- domain/
|   |   |-- index.ts
|   |   `-- pcb.ts
|   |-- features/
|   |   `-- intake/
|   |       |-- classifyFile.ts
|   |       |-- completenessScore.ts
|   |       |-- formatFileSize.ts
|   |       |-- intakeTypes.ts
|   |       `-- useFileIntake.tsx
|   |-- pages/
|   |   |-- shared/
|   |   |-- LandingPage.tsx
|   |   |-- IntakePage.tsx
|   |   |-- DashboardPage.tsx
|   |   |-- BoardOverviewPage.tsx
|   |   |-- ComponentsPage.tsx
|   |   |-- NetsPage.tsx
|   |   |-- PowerPage.tsx
|   |   |-- BomPage.tsx
|   |   |-- FirmwarePage.tsx
|   |   `-- ReportsPage.tsx
|   |-- styles/
|   |   `-- globals.css
|   `-- main.tsx
|-- index.html
|-- package.json
|-- package-lock.json
|-- README.md
`-- tsconfig.json
```

## Phase 2 Intake Feature

The intake feature is intentionally modular:

- `classifyFile.ts` maps file metadata to a file category and confidence level.
- `completenessScore.ts` calculates category-based readiness without counting duplicate categories twice.
- `useFileIntake.tsx` stores selected files, selected mode, total size, and completeness in React state.
- `intakeTypes.ts` defines the Phase 2 intake contracts.

## Separation of Concerns

Parsing:
Converts source files such as Gerber, drill, BOM, placement, schematic, netlist, firmware, or archives into parser-specific records. No parser is implemented in Phase 2.

Normalization:
Converts parser-specific records into stable domain model objects such as projects, components, nets, pads, tracks, vias, drill holes, BOM items, placement items, power rails, and firmware pin maps. No normalization pipeline is implemented in Phase 2.

Analysis:
Consumes normalized project data and produces traceable issues with severity and confidence levels. No analysis engine is implemented in Phase 2.

Reporting:
Consumes project data and analysis issues to produce engineering reports. No report generator is implemented in Phase 2.

UI presentation:
Presents the application shell, route structure, local file intake, metadata classification, completeness scoring, and clearly labeled parser limitations.

Exporting:
Produces downloadable artifacts such as reports or structured data exports. No export workflow is implemented in Phase 2.

## Domain Model Boundary

The TypeScript domain files still define contracts only. They remain free of parser logic, analysis assumptions, mock findings, or generated engineering conclusions.

## Recommended Next Architecture Steps

For Phase 3, create the normalized project model, parser status model, confidence system integration, and missing-data warning model. Do not implement real KiCad, EasyEDA, Gerber, Excellon, IPC-356, BOM, placement, firmware, report, or export logic until a later phase explicitly authorizes it.
