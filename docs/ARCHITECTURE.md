# GEBER AI Architecture

## Phase 1 Architecture Decision

Phase 1 migrates the Phase 0 Vite + TypeScript foundation to a React + TypeScript + Vite application. React Router owns client-side routing, while the domain model remains isolated from presentation code.

The application shell is intentionally non-functional beyond navigation. Upload, classification, parsing, analysis, reporting, firmware, BOM generation, and export concerns remain future phases.

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

## Separation of Concerns

Parsing:
Converts source files such as Gerber, drill, BOM, placement, schematic, netlist, firmware, or archives into parser-specific records. No parser is implemented in Phase 1.

Normalization:
Converts parser-specific records into stable domain model objects such as projects, components, nets, pads, tracks, vias, drill holes, BOM items, placement items, power rails, and firmware pin maps. No normalization pipeline is implemented in Phase 1.

Analysis:
Consumes normalized project data and produces traceable issues with severity and confidence levels. No analysis engine is implemented in Phase 1.

Reporting:
Consumes project data and analysis issues to produce engineering reports. No report generator is implemented in Phase 1.

UI presentation:
Presents the application shell, route structure, planning pages, and clearly labeled future surfaces. Phase 1 UI does not claim real project data exists.

Exporting:
Produces downloadable artifacts such as reports or structured data exports. No export workflow is implemented in Phase 1.

## Domain Model Boundary

The TypeScript domain files define contracts only. They remain free of parser logic, analysis assumptions, mock findings, or generated engineering conclusions.

## Recommended Next Architecture Steps

For Phase 2, add upload and file classification modules only. Keep parser and analysis implementations out of Phase 2 unless a later phase explicitly authorizes them.

Potential Phase 2 folders:

- `src/intake/`
- `src/file-classification/`

Do not create parsing, normalization, analysis, reporting, firmware, or exporting modules until their phases begin.
