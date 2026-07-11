# GEBER AI Final MVP Workflow Specification

This document defines the target workflow for the simplified MVP.

Product Realignment Phase B implementation note: `/` is now the primary upload and public mode-selection workflow. `/intake` is compatibility only and redirects to `/`. The final `/processing` and `/result` routes are still future work.

Product Realignment Phase C implementation note: the temporary public-to-internal mode adapter has been removed. The active workflow stores `inspect` and `firmware` directly, builds a canonical schematic-plus-Gerber input package, and selects the existing deterministic report or firmware manual through a synchronous orchestrator.

Product Realignment Phase D1 implementation note: individual Gerber files and ZIP Gerber packages are accepted on `/`. ZIP packages are extracted and classified locally in the browser with `fflate`; only extracted Gerber entries enter `ProjectInputPackage.gerberFiles`. The ZIP parent itself, drill entries, documents, nested archives, BOM, placement, PCB, IPC, EasyEDA, and other noncanonical entries do not satisfy Gerber readiness.

Product Scope Override: the canonical MVP accepts only schematic files and Gerber/Gerber-package files as user inputs. Uploaded BOM, pick-and-place, IPC-356, native KiCad PCB, separate required drill input, EasyEDA, and optional advanced project evidence are not part of the canonical workflow.

## Primary route model

Public routes:

| Route | Role |
| --- | --- |
| `/` | Landing page, mode selection, upload, readiness, and start action. |
| `/processing` | Professional processing state with real progress and diagnostics. |
| `/result` | Mode-specific final output. |

Optional advanced routes:

| Route | Role |
| --- | --- |
| `/result/evidence` | Detailed evidence tables and parser diagnostics. |
| `/result/report` | Inspect report detail or printable report route. |
| `/result/firmware` | Firmware master document detail route. |

Compatibility route:

| Route | Role |
| --- | --- |
| `/intake` | Compatibility redirect to `/` during migration. |

## Mode model

## Canonical input model

```ts
type ProjectInputPackage = {
  schematicFiles: readonly LocalDesignFile[];
  gerberFiles: readonly LocalDesignFile[];
};
```

The workflow orchestrator must not require optional external evidence files. Gerber package extraction is intake-only; it does not parse Gerber geometry, apertures, commands, X2 attributes, or Excellon drill content.

The final MVP should expose only two modes:

```ts
type ProjectMode = "inspect" | "firmware";
```

Mode labels:

- `inspect`: Inspect / Analysis.
- `firmware`: Firmware.

The previous `basic | analyze | firmware` model is retired from active source code. Historical parser and report code may still mention older evidence categories, but the active mode contract is only `inspect | firmware`.

## Landing page workflow

The landing page must be the only primary upload workflow.

Required visible elements:

- GEBER AI identity.
- One concise sentence explaining the product.
- Inspect / Analysis mode card or segmented control.
- Firmware mode card or segmented control.
- Schematic upload area.
- Gerber/package upload area.
- File readiness summary.
- Primary action:
  - "Process inspection" for Inspect mode.
  - "Build firmware document" for Firmware mode.
- Privacy/local-processing notice.

Do not show a wall of engineering data before processing.

The active landing workflow must not present uploaded BOM, pick-and-place, IPC-356, native KiCad PCB, EasyEDA, or separate drill files as product inputs.

Gerber/package upload behavior:

- Individual Gerber files are classified directly.
- ZIP packages are extracted in browser memory only.
- Nested directories inside ZIP packages are supported.
- Unsafe archive paths, nested ZIP archives, drill-only packages, documents, and noncanonical files are diagnosed but not added as canonical Gerber evidence.
- Package summaries show compressed size, extracted size, total entries, Gerber entries, ignored entries, warning/error counts, and collapsed entry details.

## Processing workflow

Processing should be a full-screen or route-level state. It should not rely on fake timers or fake percentages.

Required stages:

```text
read files
  -> classify files
  -> run implemented parser jobs
  -> normalize project evidence
  -> generate selected mode output
  -> transition to result
```

Real progress formula:

```text
fileReadUnits = selectedFiles.length
classificationUnits = selectedFiles.length
parserUnits = count(files with implemented parser support)
normalizationUnits = 1
modeOutputUnits = 1

totalUnits =
  fileReadUnits
  + classificationUnits
  + parserUnits
  + normalizationUnits
  + modeOutputUnits

completedUnits =
  filesRead
  + filesClassified
  + parserJobsCompleted
  + normalizationCompleted
  + modeOutputCompleted

progressPercent = round((completedUnits / totalUnits) * 100)
```

Current implemented parser job categories:

- `kicad-schematic`.

Legacy parser job categories that exist in code but are not canonical user inputs:

- `kicad-pcb`.
- `bom` for uploaded CSV/TSV.
- `pick-and-place` for uploaded CSV/TSV.

Metadata-only categories must not be treated as parser jobs:

- Gerber.
- Extracted Gerber package entries.

Noncanonical categories must not be required by the orchestrator:

- Drill as a separate required input.
- IPC-356.
- ZIP parent files.
- EasyEDA.
- KiCad project file.
- Uploaded BOM files.
- Uploaded pick-and-place files.

## Result workflow

`/result` should render one primary output based on selected mode.

### Inspect result

The Inspect result should contain:

- Executive summary.
- Evidence completeness.
- File parsing status.
- Board/manufacturing findings.
- Schematic findings.
- Schematic-to-Gerber findings only where Gerber facts actually exist.
- Component findings.
- Net findings.
- Power findings.
- Placement correlation marked unavailable unless Gerber attributes support it.
- Schematic-derived BOM with unknown fields preserved when the generator exists.
- Risk list with severity.
- Recommendations.
- Missing data.
- Confidence.
- Limitations.
- Evidence references.
- Export actions.
- Optional AI explanation.

Wording must separate:

- Facts.
- Inferences.
- Missing data.
- Limitations.
- Recommendations.

### Firmware result

The Firmware result should contain:

- Board summary.
- MCU candidates.
- MCU pin map.
- Bus map.
- Peripheral map.
- Connector pinouts.
- Power, reset, boot, programming, enable, and interrupt map.
- Driver suggestions.
- Initialization order.
- Bring-up checklist.
- Safety notes.
- Missing data.
- Confidence.
- Evidence references.
- Export actions.
- Optional AI explanation.

Firmware mode must not claim pin correctness when only incomplete evidence is available.

Firmware mode must not depend on uploaded BOM, native PCB, placement, IPC, EasyEDA, or other noncanonical files.

## Current Phase C orchestrator

The Phase C orchestrator is synchronous and reuses existing normalized project state. It does not parse files again, does not generate fake progress, and does not create `/processing` or `/result`.

Inspect mode:

- Requires at least one schematic file and at least one Gerber/package file.
- Returns a blocked result if either canonical input is missing.
- Selects the existing engineering report when available.
- Marks schematic-derived BOM generation as `deferred`.
- Preserves limitations that Gerber geometry parsing, schematic-to-Gerber correlation, manufacturing validation, and production readiness are unavailable.

Firmware mode:

- Requires at least one schematic file and at least one Gerber/package file.
- Returns a blocked result if either canonical input is missing.
- Selects the existing firmware manual when available.
- Preserves limitations that Gerber content is not parsed, mappings may be incomplete, and datasheet verification remains required.

## Current Phase D1 package intake

Phase D1 adds local ZIP extraction only. The selected dependency is `fflate` because it is browser-compatible, works with byte arrays, has no native filesystem requirement, and supports deterministic test generation/extraction.

Safety limits:

```ts
GERBER_PACKAGE_LIMITS = {
  maxCompressedBytes: 50 * 1024 * 1024,
  maxExtractedBytes: 150 * 1024 * 1024,
  maxEntries: 500,
  maxSingleEntryBytes: 50 * 1024 * 1024,
};
```

Package intake rejects or diagnoses:

- Invalid or corrupt ZIP files.
- Empty ZIP files.
- Packages with no supported Gerber entries.
- Too many entries.
- Excessive extracted size.
- Oversized individual entries.
- Encrypted entries.
- Unsupported compression methods.
- Unsafe absolute, drive-letter, null-character, or `..` paths.
- Nested ZIP archives, which are not recursively extracted.
- Duplicate entry paths.

Package extraction is memory-only. It does not write files to disk, upload files to the backend, send package contents to OpenAI, persist state, or claim manufacturing analysis.

## Evidence-tier behavior

| Tier | Evidence | Result behavior |
| --- | --- | --- |
| Tier 0 | Unsupported or insufficient files | Explain missing evidence and stop short of engineering findings. |
| Tier 1 | Schematic only | Report schematic facts, firmware-relevant logical evidence, and missing Gerber evidence. |
| Tier 2 | Schematic plus Gerber files detected | Report schematic facts and Gerber presence; do not claim geometry analysis. |
| Tier 3 | Schematic plus parsed Gerber geometry or attributes | Future tier only after Gerber parser work; enable physical facts supported by parsed attributes. |
| Tier 4 | Schematic plus parsed Gerber attributes sufficient for correlation | Future tier only; enable limited schematic-to-Gerber and placement correlation with strict evidence wording. |

## State model

Current route navigation can preserve upload state because `FileIntakeProvider` wraps the app and stores state in React context. The MVP can initially keep this behavior.

Future concerns:

- Browser reload loses uploaded file state.
- Deep-linking directly to `/processing` or `/result` without state needs a clear empty state.
- Optional persistence should be considered after MVP workflow lock, not during Phase B.

## AI behavior

AI review is optional and secondary.

Allowed locations:

- Inside final Inspect result after deterministic report generation.
- Inside final Firmware result only after deterministic firmware document generation.

Allowed actions:

- Explain this report.
- Prioritize these risks.
- Generate engineering narrative.

Disallowed behavior:

- AI parsing.
- AI inventing facts.
- AI replacing deterministic checks.
- AI claiming electrical or manufacturing correctness.

## Error and warning behavior

Errors:

- Show one clear top-level alert.
- Include the failed file or stage.
- Offer a direct recovery action.

Warnings:

- Summarize warning count and highest severity.
- Keep parser diagnostics and raw warnings behind details.
- Preserve evidence limitations without repeating the same disclaimer on every page.

## Accessibility requirements

- All upload controls must be keyboard reachable.
- Mode selection must be accessible as radio/segmented controls.
- Severity must be conveyed by text, not color alone.
- Reduced-motion users must receive simple non-animated transitions.
- Result tables must remain usable on mobile via priority columns or detail views.

## Next implementation phase

Product Realignment Phase D2 should implement only the Gerber RS-274X Geometry Parser. It must not add schematic-Gerber correlation, generated BOM, `/processing`, `/result`, backend upload, or AI behavior unless explicitly scoped.
