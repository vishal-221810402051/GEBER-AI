# GEBER AI Architecture

## Phase 3 Architecture Decision

Phase 3 adds a normalized metadata-level project model on top of the React + TypeScript + Vite application. The model bridges Phase 2 file intake metadata to future parser-backed project data without parsing file contents.

Parser stages, missing-data warnings, evidence, and assumptions are deterministic TypeScript models. They do not claim real PCB extraction or analysis.

## Current Structure

```text
.
|-- docs/
|-- src/
|   |-- app/
|   |-- components/
|   |-- domain/
|   |   |-- evidence.ts
|   |   |-- index.ts
|   |   |-- parser.ts
|   |   |-- pcb.ts
|   |   |-- project.ts
|   |   `-- warnings.ts
|   |-- features/
|   |   |-- intake/
|   |   `-- project-model/
|   |       |-- buildMissingDataWarnings.ts
|   |       |-- buildNormalizedProject.ts
|   |       |-- buildParserStatus.ts
|   |       |-- buildProjectEvidence.ts
|   |       `-- projectModelTypes.ts
|   |-- pages/
|   |-- styles/
|   `-- main.tsx
|-- index.html
|-- package.json
|-- package-lock.json
|-- README.md
`-- tsconfig.json
```

## Phase 3 Project Model

The normalized project model supports:

- Project ID, name, and timestamps.
- Source files and file categories.
- Completeness score and readiness label.
- Parser status stages.
- Missing-data warnings.
- Direct metadata evidence.
- Inferred metadata evidence.
- Assumptions.
- Future board, schematic, BOM, placement, firmware, and report model placeholders.

## Parser Status Boundary

Only file classification can be marked complete from Phase 2 metadata. Every content parser stage is marked as queued for a future parser, unavailable in the current phase, skipped, or missing a required file.

No parser engine exists in Phase 3.

## Evidence Boundary

Allowed evidence:

- File name.
- File size.
- File extension.
- MIME metadata when available.
- Detected category.
- Classification confidence.
- Selected mode.
- Completeness score.

Forbidden evidence examples:

- Claims that real components were found.
- Claims that real nets were extracted.
- Claims that power rails were found.
- Claims that a BOM was generated.
- Claims that firmware pins were mapped.
- Claims that electrical findings exist.

## Recommended Next Architecture Steps

Phase 4 should begin the KiCad PCB Parser MVP. The parser should feed real parser results into the Phase 3 parser status and normalized project models without adding unrelated parser families or analysis engines.
