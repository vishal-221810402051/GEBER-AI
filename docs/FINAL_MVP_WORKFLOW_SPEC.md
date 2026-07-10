# GEBER AI Final MVP Workflow Specification

This document defines the target workflow for the simplified MVP. It is a specification only; Product Realignment Phase A does not implement it.

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
| `/intake` | Temporary redirect or alias to `/` during migration. |

## Mode model

The final MVP should expose only two modes:

```ts
type ProjectMode = "inspect" | "firmware";
```

Mode labels:

- `inspect`: Inspect / Analysis.
- `firmware`: Firmware.

The current `basic | analyze | firmware` model should be retired during the mode orchestration phase.

## Landing page workflow

The landing page must be the only primary upload workflow.

Required visible elements:

- GEBER AI identity.
- One concise sentence explaining the product.
- Inspect / Analysis mode card or segmented control.
- Firmware mode card or segmented control.
- Schematic upload area.
- Gerber/package upload area.
- Optional advanced evidence disclosure:
  - KiCad PCB.
  - IPC-356.
  - BOM.
  - Pick-and-place.
- File readiness summary.
- Primary action:
  - "Process inspection" for Inspect mode.
  - "Build firmware document" for Firmware mode.
- Privacy/local-processing notice.

Do not show a wall of engineering data before processing.

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
- `kicad-pcb`.
- `bom` for CSV/TSV.
- `pick-and-place` for CSV/TSV.

Metadata-only categories must not be treated as parser jobs:

- Gerber.
- Drill.
- IPC-356.
- ZIP/archive.
- EasyEDA.
- KiCad project file.
- Unsupported spreadsheet content.

## Result workflow

`/result` should render one primary output based on selected mode.

### Inspect result

The Inspect result should contain:

- Executive summary.
- Evidence completeness.
- File parsing status.
- Board/manufacturing findings.
- Schematic findings.
- Cross-comparison findings.
- Component findings.
- Net findings.
- Power findings.
- Placement findings.
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

## Evidence-tier behavior

| Tier | Evidence | Result behavior |
| --- | --- | --- |
| Tier 0 | Unsupported or insufficient files | Explain missing evidence and stop short of engineering findings. |
| Tier 1 | Schematic plus ordinary Gerber | Report schematic facts and Gerber presence; do not claim geometry analysis. |
| Tier 2 | Schematic plus Gerber X2/drill | Same as Tier 1 until Gerber/drill parsers exist. |
| Tier 3 | Schematic plus IPC/BOM/placement | Use table evidence where parsed; mark IPC as metadata-only until parser exists. |
| Tier 4 | Schematic plus native KiCad PCB | Run strongest current deterministic evidence and heuristic analysis. |

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

Product Realignment Phase B should implement only the single landing and mode workflow:

- Move intake UI to `/`.
- Keep `/intake` as compatibility.
- Keep existing parser and analysis logic unchanged.
- Do not add a new orchestrator yet.
- Do not implement Gerber parsing yet.
