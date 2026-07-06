# GEBER AI Architecture

## Phase 0 Architecture Decision

The current repository was not initialized as an application, so Phase 0 locks a minimal Vite + TypeScript architecture. This keeps the project lightweight while leaving room to add a UI framework, routing, workers, persistence, and server-side services in later phases.

## Current Structure

```text
.
├── docs/
│   ├── ARCHITECTURE.md
│   └── GEBER_AI_PHASE_ROADMAP.md
├── src/
│   ├── domain/
│   │   ├── index.ts
│   │   └── pcb.ts
│   └── main.ts
├── index.html
├── package.json
├── README.md
└── tsconfig.json
```

## Separation of Concerns

Parsing:
Converts source files such as Gerber, drill, BOM, placement, schematic, netlist, firmware, or archives into parser-specific records. No parser is implemented in Phase 0.

Normalization:
Converts parser-specific records into stable domain model objects such as projects, components, nets, pads, tracks, vias, drill holes, BOM items, placement items, power rails, and firmware pin maps. No normalization pipeline is implemented in Phase 0.

Analysis:
Consumes normalized project data and produces traceable issues with severity and confidence levels. No analysis engine is implemented in Phase 0.

Reporting:
Consumes project data and analysis issues to produce engineering reports. No report generator is implemented in Phase 0.

UI presentation:
Presents workflows and project state to users. No UI shell or dashboard is implemented in Phase 0.

Exporting:
Produces downloadable artifacts such as reports or structured data exports. No export workflow is implemented in Phase 0.

## Domain Model Boundary

The TypeScript domain files define contracts only. They are intentionally free of parser logic, analysis assumptions, mock findings, or generated engineering conclusions.

## Recommended Next Architecture Steps

For Phase 1, add the application shell and navigation only. Keep parsing, analysis, and reporting out of the UI layer by introducing separate modules when those phases begin:

- `src/parsing/`
- `src/normalization/`
- `src/analysis/`
- `src/reporting/`
- `src/exporting/`
- `src/presentation/`

These folders should be created only when their phase begins.
