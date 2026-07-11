# GEBER AI Product Realignment Phase A Investigation

## Product scope override notice

This investigation predates the current Product Scope Override. Current canonical MVP user inputs are only schematic files and Gerber/Gerber-package files:

```ts
type ProjectInputPackage = {
  schematicFiles: readonly LocalDesignFile[];
  gerberFiles: readonly LocalDesignFile[];
};
```

Uploaded BOM, pick-and-place, IPC-356, native KiCad PCB, separate required drill input, EasyEDA, and optional advanced project evidence are not canonical user inputs. Historical recommendations below that mention optional advanced evidence are superseded by the Product Scope Override and the updated workflow, capability matrix, roadmap, and migration plan.

Product Realignment Phase C has now locked the active mode and workflow contracts: the application stores `inspect | firmware` directly, removes the temporary `inspect -> analyze` adapter from active source, removes the public Advanced Evidence disclosure, and selects either the existing engineering report or firmware manual from deterministic normalized state.

## Executive diagnosis

GEBER AI is a capable React, TypeScript, Vite application with a local-first deterministic processing pipeline, a Node/Express backend foundation, and an optional AI review endpoint. Architecture Phases A through F are committed on `main`; the current locked baseline is `8261d9b Architecture Phase F AI review UX polish`.

The application has more engineering infrastructure than the intended MVP needs, but the product workflow has drifted. The original product should guide the user through one primary path: choose Inspect / Analysis or Firmware, upload schematic and manufacturing evidence, process the project, and receive one mode-specific output. The current app exposes the implementation history as many routes and evidence pages before the user reaches a final result.

The largest technical gap is Gerber capability. The current project recognizes Gerber, drill, IPC-356, EasyEDA, and archive files by metadata, but it does not parse Gerber geometry, Excellon drill geometry, IPC netlists, ZIP contents, or EasyEDA exports. KiCad schematic, KiCad PCB, BOM CSV/TSV, and pick-and-place CSV/TSV parsing are real and test-covered. Therefore the product can produce useful evidence-linked reports, but it must not claim true Gerber geometry analysis or Gerber-to-schematic validation yet.

## Actual product objective

The locked MVP objective is a simple workflow:

1. User opens `/`.
2. User selects one mode:
   - Inspect / Analysis.
   - Firmware.
3. User uploads schematic files and a Gerber package or individual Gerber files.
4. Application processes the project with professional real progress feedback.
5. Application produces one mode-specific output:
   - Inspect mode: a prioritized engineering inspection report.
   - Firmware mode: a master firmware-development document.

Uploaded BOM, pick-and-place, IPC-356, native KiCad PCB, EasyEDA, and separate required drill files are not product inputs in the locked MVP.

The landing page must become the main intake interface. There should not be a second duplicated upload workflow, and the user should not need to visit many pages to understand the result.

## Repository gate

- Current branch: `main`.
- Latest commit on `main`: `8261d9b Architecture Phase F AI review UX polish`.
- Recent locked commits:
  - `8261d9b Architecture Phase F AI review UX polish`.
  - `9afe1df Architecture Phase E AI review prototype`.
  - `6e10c25 Architecture Phase D backend foundation`.
- Working tree at investigation start: clean.
- Architecture Phase F: committed.
- Architecture Phase G: not present on `main`; superseded WIP was archived separately before this investigation.
- Unexpected files at gate: none.

## Current project readiness

The repository is a working MVP prototype, not a production engineering validation system.

Ready or mostly ready:

- React route shell and shared UI components.
- Local file intake state.
- KiCad schematic parsing.
- KiCad PCB parsing.
- BOM CSV/TSV parsing.
- Pick-and-place CSV/TSV parsing.
- Normalized project assembly from available deterministic evidence.
- Deterministic report builder and exports.
- Firmware guidance builder from schematic, PCB, net, BOM, and placement evidence.
- Optional AI review of deterministic report evidence.

Partial or prototype:

- Schematic logical analysis.
- Schematic-to-PCB comparison.
- Net inventory and net classification.
- Decoupling, pull resistor, placement, and power analysis.
- Processing progress model.
- Final result workflow and route model.

Not ready:

- Real Gerber geometry parsing.
- Drill geometry parsing.
- Gerber X2 attribute extraction.
- IPC-356 netlist parsing.
- ZIP/archive ingestion.
- EasyEDA import.
- Production electrical validation.
- Production manufacturing validation.

## Current workflow map

Actual workflow from source:

```text
App
  -> AppLayout
      -> global navigation
      -> StatusBanner
      -> FileIntakeProvider context

LandingPage (/)
  -> product summary
  -> link to /intake
  -> link to /dashboard

IntakePage (/intake)
  -> IntakeModeSelector
      -> mode stored as "basic" | "analyze" | "firmware"
  -> UploadDropzone
      -> useFileIntake.addFiles
          -> classifyFile
          -> add LocalDesignFile records
  -> useFileIntake effects
      -> parseKicadPcb for kicad-pcb files
      -> parseKicadSchematic for kicad-schematic files
      -> parseBom for bom files
      -> parsePlacement for pick-and-place files
  -> buildNormalizedProject
      -> completeness score
      -> missing data warnings
      -> parser status
      -> project evidence
      -> net inventory
      -> board analysis
      -> firmware manual
      -> engineering report
  -> deriveIntakeProcessingState
      -> visible parser progress and pipeline stages
  -> IntakeNextActions
      -> links to dashboard, reports, firmware, evidence pages

DashboardPage (/dashboard)
  -> reads normalizedProject
  -> summarizes parser, evidence, analysis, firmware, and report state

Evidence pages
  -> BoardOverviewPage (/board)
  -> ComponentsPage (/components)
  -> NetsPage (/nets)
  -> PowerPage (/power)
  -> BomPage (/bom)

Output pages
  -> FirmwarePage (/firmware)
      -> firmware manual sections and guidance
  -> ReportsPage (/reports)
      -> engineering report
      -> exports
      -> optional AiReviewPanel

Backend
  -> /api/health
  -> /api/capabilities
  -> /api/ai-review
      -> consent-gated AI narrative over deterministic report evidence
```

## Intended workflow map

Recommended final public workflow:

```text
LandingPage (/)
  -> select ProjectMode: "inspect" | "firmware"
  -> upload schematic files
  -> upload Gerber package or individual Gerber/drill files
  -> optional advanced evidence disclosure
      -> KiCad PCB
      -> IPC-356
      -> BOM
      -> pick-and-place
  -> start processing

Processing (/processing)
  -> real stage progress
      -> file read
      -> classification
      -> parser jobs completed
      -> normalization completed
      -> mode-specific output completed
  -> warning and error states

Result (/result)
  -> if mode is "inspect"
      -> one inspection report
      -> facts, inferences, missing data, limitations, recommendations
      -> optional "Explain this report" AI action
      -> export
  -> if mode is "firmware"
      -> one master firmware document
      -> MCU candidates, pin map, buses, connectors, rails, bring-up, safety
      -> optional "Explain this report" AI action
      -> export

Optional advanced detail routes
  -> /result/evidence
  -> /result/report
  -> /result/firmware
```

## Route audit

| Route | Current purpose | Unique value | Duplicate or overload | MVP disposition |
| --- | --- | --- | --- | --- |
| `/` | Lightweight home with links | Brand entry | Does not contain mode or upload | Refactor into primary intake |
| `/intake` | Upload, mode, parser status, readiness | Most important workflow logic | Duplicates future landing purpose | Merge into `/`; keep temporary redirect or compatibility route |
| `/dashboard` | Broad project summary | Useful internal status overview | Repeats data from result and evidence pages | Hide from primary nav or merge into `/result` summary |
| `/review` | Not present on Phase F `main` | None on locked baseline | Phase G WIP archived | Do not add in this realignment path |
| `/board` | Native KiCad PCB evidence | Parsed board/layer/footprint facts | Too advanced for primary flow | Keep as advanced evidence route |
| `/components` | Component source evidence | Component evidence reconciliation | Wide and dense | Keep as advanced evidence route |
| `/nets` | Net inventory and exports | Filterable net table | Detailed engineering wall | Keep as advanced evidence route |
| `/power` | Power tree and rail evidence | Power analysis details | Detailed engineering wall | Keep as advanced evidence route |
| `/bom` | BOM parser output and export | BOM table | Should be secondary evidence | Keep as advanced evidence route |
| `/firmware` | Firmware guidance output | Closest firmware result | Should be mode-specific final result | Merge into `/result` for firmware mode; optional detail route |
| `/reports` | Engineering report output | Closest inspect result and export | Should be mode-specific final result | Merge into `/result` for inspect mode; optional detail route |

## Upload duplication audit

Upload currently lives on `/intake` because earlier frontend phases separated the product home from the upload workspace. The reusable upload pieces already exist:

- `src/features/intake/useFileIntake.tsx`
- `src/components/intake/UploadDropzone.tsx`
- `src/components/intake/IntakeModeSelector.tsx`
- `src/components/intake/FileInventoryGroup.tsx`
- `src/components/intake/IntakeReadinessPanel.tsx`
- `src/components/intake/ParserStatusAccordion.tsx`
- `src/components/intake/IntakeNextActions.tsx`

Upload state is stored in `FileIntakeProvider`, so state survives route changes inside the current single-page app. Users should not need to upload repeatedly when navigating between current routes. State does not survive a full browser reload because there is no persistence layer.

Migration conclusion:

- `/` can reuse the existing intake components directly.
- `/intake` can later redirect to `/` or render the same component as compatibility.
- Mode selection currently exists only in intake UI, but the route model makes it feel separate from landing.
- The future landing page should own mode, upload, readiness, and the start-processing action.
- No parser changes are needed for the first migration step.

## File capability matrix

| Format | Recognized | Parsed | Current role | Confidence |
| --- | --- | --- | --- | --- |
| `.kicad_sch` | Yes | Yes | Schematic source | Medium |
| `.kicad_pcb` | Yes | Yes | Native PCB layout source | Medium-high |
| `.kicad_pro` | Yes | Metadata only | Project marker | Low |
| Gerber RS-274X | Yes | No | Manufacturing file presence only | Low |
| Gerber X2 | Filename-inferred only | No | Manufacturing file presence only | Low |
| Excellon drill | Yes | No | Drill file presence only | Low |
| IPC-356 | Yes | No | Netlist file presence only | Low |
| BOM CSV/TSV | Yes | Yes | Component table evidence | Medium |
| Pick-and-place CSV/TSV | Yes | Yes | Placement table evidence | Medium |
| ZIP archives | Yes | No | Archive presence only | Low |
| EasyEDA exports | Yes | No | Future import candidate | Low |

Definitive Gerber answer: the current system does not contain a real Gerber geometry parser. It classifies Gerber-like files and reports their presence, but it does not extract copper geometry, board outlines, solder mask, silkscreen, X2 attributes, net names, drills, or reference designators from Gerber data.

## Schematic/Gerber feasibility

### Schematic only

Current support:

- Symbols and symbol properties.
- Library pins and symbol pin instances.
- Labels, global labels, hierarchical labels, text, wires, junctions, no-connects, and sheets.
- Power rail identification by net or label naming heuristics.
- MCU candidate detection from symbol and component metadata.
- Firmware mapping when pin and net evidence is available.

Current limitations:

- No complete schematic connectivity solver.
- No full hierarchical sheet aggregation.
- Bus support is inferred from labels and names, not a full bus resolver.
- Logical completeness checks are heuristic, not formal validation.

### Gerber only

Current support:

- File classification and metadata.
- Missing-file and evidence-gap warnings.

Current limitations:

- No layer content parsing.
- No copper geometry.
- No board outline extraction.
- No drill geometry.
- No solder mask or silkscreen geometry.
- No X2 attribute extraction.
- No net names.
- No component attributes.
- No placement or reference designators.

### Schematic plus ordinary Gerber

Reliable current correlation: none beyond confirming both categories were supplied. Ordinary Gerber currently cannot be compared to schematic nets or components.

### Schematic plus Gerber X2

Reliable current correlation: none. X2 is not parsed; the current classifier only infers X2-like files from filename hints.

### Schematic plus Gerber plus IPC-356

Reliable current correlation: none in the current code because IPC-356 content is not parsed.

### Schematic plus KiCad PCB

Reliable current correlation:

- Native PCB nets, pads, tracks, vias, zones, footprints, layers, and outline facts can be parsed.
- Schematic labels and PCB net names can be presented together in the normalized net inventory.
- Firmware pin maps can match schematic symbol pins to PCB pads when reference and pin number evidence align.

Restrictions:

- This is evidence correlation, not proof of correctness.
- No full schematic netlist-to-PCB validation is implemented.
- Name-based net matching can miss unnamed or locally scoped schematic connectivity.

### Schematic plus Gerber plus placement plus BOM

Reliable current correlation:

- Gerber contributes only file presence.
- BOM and placement can add component table evidence by reference designator.
- Native PCB, if supplied, is still the main physical correlation source.

## Evidence tiers

| Tier | Evidence | Available checks | Unavailable checks | Confidence | Report wording restrictions |
| --- | --- | --- | --- | --- | --- |
| Tier 0 | Unsupported or insufficient files | File inventory, missing data | Parsing, analysis, correlation | Very low | Say evidence is insufficient |
| Tier 1 | Schematic plus ordinary Gerber | Schematic facts, Gerber presence | Gerber geometry, schematic-Gerber correlation | Low | Do not claim manufacturing or cross-validation |
| Tier 2 | Schematic plus Gerber X2/drill | Same as Tier 1 today, plus file presence for drill/X2 | X2 attributes, drill geometry, net correlation | Low | State X2/drill content is not parsed yet |
| Tier 3 | Schematic plus IPC/BOM/placement | Schematic, BOM, placement table evidence | IPC parsing, Gerber validation, full manufacturing checks | Medium-low | Call matches evidence-linked and incomplete |
| Tier 4 | Schematic plus native KiCad PCB | Schematic facts, PCB nets/pads/footprints/geometry, heuristic analyses | Formal electrical/manufacturing validation | Medium | Use "observed", "inferred", and "requires review" language |

## Parser readiness matrix

| Parser | Classification | Source files | Inputs | Outputs | Test coverage | Necessary for MVP |
| --- | --- | --- | --- | --- | --- | --- |
| KiCad schematic | MVP-capable | `src/features/parsers/kicadSchematic/*` | `.kicad_sch` text | Symbols, pins, labels, wires, sheets, diagnostics | Yes | Yes |
| KiCad PCB | MVP-capable | `src/features/parsers/kicadPcb/*` | `.kicad_pcb` text | Layers, nets, footprints, pads, tracks, vias, zones, outline facts | Yes | Optional advanced evidence |
| BOM | MVP-capable for CSV/TSV | `src/features/parsers/bom/*` | CSV/TSV text | BOM rows, references, values, MPNs, diagnostics | Yes | Optional advanced evidence |
| Placement | MVP-capable for CSV/TSV | `src/features/parsers/placement/*` | CSV/TSV text | Reference, coordinates, side, rotation, diagnostics | Yes | Optional advanced evidence |
| Gerber | Not implemented | None | Gerber files | None beyond classification | No parser tests | Required gap for Inspect MVP claims |
| Drill | Not implemented | None | Excellon files | None beyond classification | No parser tests | Required gap for manufacturing claims |
| IPC-356 | Not implemented | None | IPC netlist files | None beyond classification | No parser tests | Optional but important correlation evidence |
| ZIP archive | Not implemented | None | ZIP packages | None beyond classification | No parser tests | Needed for ergonomic Gerber package upload |
| EasyEDA | Not implemented | None | EasyEDA exports | None beyond classification | No parser tests | Future import candidate |

## Analysis readiness matrix

| Capability | Classification | Source files | Inputs | Outputs | Known limitations | Necessary for MVP |
| --- | --- | --- | --- | --- | --- | --- |
| Net explorer | Partial | `src/features/nets/*` | KiCad PCB, schematic labels | Net inventory, source badges, diagnostics | No full schematic net solver; no Gerber/IPC contribution | Yes, as internal evidence |
| Decoupling analysis | Prototype | `src/features/analysis/buildDecouplingAnalysis.ts` | PCB footprints, pad nets | Missing/suspicious decoupling findings | Distance and naming heuristics only | Inspect output section |
| Pull resistor analysis | Prototype | `src/features/analysis/buildPullResistorAnalysis.ts` | PCB footprints, net classes | Bias resistor findings | Datasheet-dependent and heuristic | Inspect output section |
| Placement analysis | Prototype | `src/features/analysis/buildPlacementAnalysis.ts` | PCB footprints, placement rows | Placement observations | Not full DFM, no enclosure/body checks | Optional inspect evidence |
| Power tree | Prototype | `src/features/analysis/buildPowerTreeAnalysis.ts` | PCB/BOM/net evidence | Rails, candidates, budget evidence | No actual current path validation or thermal analysis | Inspect and firmware evidence |
| Firmware manual | Partial | `src/features/firmware/*` | Schematic, PCB, BOM, nets, roles | MCU candidates, pin map, buses, checklist, safety | Guidance only, not pin correctness | Firmware mode output |
| Engineering report | Mostly ready | `src/features/reporting/*` | Normalized project | Report, risks, recommendations, markdown, export data | Needs route/workflow simplification and stricter evidence tiers | Inspect mode output |
| AI Review | Mostly ready | `src/features/ai/*`, `server/src/routes/aiReview.ts` | Deterministic report evidence | Optional narrative, prioritization | Must remain post-processing and non-authoritative | Optional secondary layer |

## Mode orchestration proposal

Current mode behavior:

- Mode is stored as `"basic" | "analyze" | "firmware"` in `useFileIntake`.
- Mode is copied into the normalized project.
- Mode influences missing-data warning severity and UI wording.
- Mode does not gate parser execution.
- Mode does not create separate deterministic pipelines.
- Report and firmware builders both run from available evidence.

Recommended final mode model:

```ts
type ProjectMode = "inspect" | "firmware";

type ProjectWorkflowInput = {
  mode: ProjectMode;
  files: readonly LocalDesignFile[];
};

type ProjectWorkflowResult =
  | {
      mode: "inspect";
      project: NormalizedPCBProject;
      output: EngineeringReport;
      progress: ProjectProcessingState;
    }
  | {
      mode: "firmware";
      project: NormalizedPCBProject;
      output: FirmwareManual;
      progress: ProjectProcessingState;
    };

type RunProjectWorkflow = (
  input: ProjectWorkflowInput,
) => Promise<ProjectWorkflowResult>;
```

Recommended deterministic behavior:

```text
inspect
  -> classify
  -> parse schematic
  -> parse Gerber/drill when implemented
  -> parse optional PCB/BOM/placement/IPC evidence
  -> normalize
  -> compare available evidence by evidence tier
  -> run supported analyses
  -> generate inspection report

firmware
  -> classify
  -> parse schematic
  -> parse optional PCB/BOM/placement evidence
  -> normalize
  -> build firmware evidence
  -> generate master firmware document
```

Migration risks:

- Existing pages assume `basic | analyze | firmware`.
- Reports and firmware are currently built together.
- Tests may assert current copy or route behavior.
- Evidence tiering must be introduced before stronger report wording.
- Progress must not invent work for unsupported parsers.

## Inspect output specification

Inspect mode should produce one primary result with:

- Executive summary.
- Evidence completeness.
- File parsing status.
- Board/manufacturing findings.
- Schematic findings.
- Cross-comparison findings limited by evidence tier.
- Component findings.
- Net findings.
- Power findings.
- Placement findings.
- Risks and severity.
- Recommendations.
- Missing data.
- Confidence.
- Evidence references.
- Optional AI explanation as a secondary layer.
- Export actions.

Reusable current builders:

- `buildEngineeringReport`
- `buildReportSections`
- `buildRiskMatrix`
- `buildRecommendations`
- `buildConfidenceSummary`
- `buildMissingDataSummary`
- `buildEvidenceRegister`
- report export helpers

Required refactors:

- Make the report the single Inspect result instead of one of many routes.
- Add evidence-tier wording restrictions.
- Remove route-level duplication from dashboard/evidence pages.
- Keep AI review optional and post-report.

## Firmware output specification

Firmware mode should produce one master firmware document with:

- Board summary.
- MCU candidates.
- MCU pin map.
- Bus map.
- Peripheral map.
- Connector pinouts.
- Power, reset, boot, interrupt, enable, and programming signal map.
- Driver suggestions.
- Initialization order.
- Bring-up checklist.
- Safety notes.
- Missing data.
- Confidence.
- Evidence references.
- Export actions.

Reusable current builders:

- `buildFirmwareManual`
- `detectMcuCandidates`
- `buildFirmwarePinMap`
- `buildFirmwarePeripherals`
- `buildFirmwareConnectors`
- `buildFirmwareChecklist`
- `buildFirmwareDriverSuggestions`
- `buildFirmwareBringUpSteps`
- `buildFirmwareSafetyNotes`

Required refactors:

- Make firmware the single Firmware mode result.
- Add export support for the master document.
- Keep all pin correctness caveats visible.
- Do not claim correctness when schematic, PCB, or datasheet evidence is incomplete.

## AI role

Current AI Review is mostly aligned if it remains optional and post-processing. It already uses deterministic report summaries and does not receive raw uploaded design files.

AI may:

- Explain deterministic findings.
- Prioritize existing risks.
- Summarize missing evidence.
- Generate clearer narrative.
- Suggest next engineering checks.
- Cite evidence IDs.

AI must not:

- Parse design files.
- Replace deterministic checks.
- Invent schematic or Gerber facts.
- Claim manufacturing readiness.
- Claim electrical correctness.
- Replace engineering validation.

Recommended placement:

- Not on the landing page.
- Not before deterministic processing.
- Optional button inside final result:
  - "Explain this report".
  - "Prioritize these risks".
  - "Generate engineering narrative".

## Processing/progress model

Current processing UI is visually reusable but incomplete as a product flow. It is embedded in intake rather than being a dedicated processing experience, and progress is currently tied to parser result completion for parser-supported files.

Reusable pieces:

- `ProcessingOverlay`.
- `RadialProgress`.
- `PipelineStepper`.
- `ParserProgressTimeline`.
- `LoadingDots`.
- `GlassAlert`.
- `GlassStatusCard`.
- `useFileIntake` processing state.

Recommended real progress formula:

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

Restrictions:

- Gerber, drill, IPC, ZIP, and EasyEDA must not receive fake parser progress until parsers exist.
- Metadata-only classification may count as classification work, not parser work.
- Reduced-motion support must be preserved.
- Error and warning transitions should use real parser diagnostics and missing evidence warnings.

## UI/UX specification

Desired product feel:

- Professional, calm, pleasant, and minimal.
- Dark graphite base.
- Soft gray glass windows.
- Green glass success states.
- Red glass error states.
- Amber warning states.
- Orange active-processing accent.
- Smooth professional motion.
- Strong hierarchy.
- Few default cards.
- No engineering data wall before processing.

Landing page should contain only:

- GEBER AI identity.
- One concise sentence.
- Inspect / Analysis mode selector.
- Firmware mode selector.
- Schematic upload.
- Gerber/package upload.
- Optional advanced evidence disclosure.
- Primary action.
- Privacy/local-processing notice.

Recommended layout:

- Desktop: centered two-column intake with mode and readiness on one side, upload inventory on the other.
- Mobile: single column with mode first, upload second, readiness third, action pinned near the end.
- Navigation before processing: hidden or minimal.
- Result page: strong title, status, export action, summary, top risks, detailed evidence behind disclosure.
- Error alerts: one compact top-level error with actionable file diagnostics.
- Typography: concise route-level headings, small dense technical labels only inside details.
- Spacing: generous landing spacing, tighter result data spacing.
- Accessibility: keyboard upload path, visible focus states, reduced-motion support, non-color severity labels.

## Removal/consolidation plan

Detailed route and component classifications are in `docs/ROUTE_COMPONENT_MIGRATION_PLAN.md`.

Summary:

- Keep unchanged for now: parser modules, normalized model, backend AI routes, export helpers.
- Reuse internally: current intake components, evidence pages, dashboard summaries, report sections, firmware sections.
- Refactor: `LandingPage`, `IntakePage`, mode model, processing state, result page composition.
- Merge: `/intake` into `/`, `/reports` and `/firmware` into `/result`.
- Hide from primary navigation: `/dashboard`, `/board`, `/components`, `/nets`, `/power`, `/bom`.
- Deprecate later: `/intake` as a standalone public route after compatibility window.
- Remove only after migration: stale route copy, duplicated status panels, public implementation-phase language.

## Risks

- Moving upload to `/` can break assumptions in `IntakePage` tests and navigation copy.
- Replacing `basic | analyze | firmware` with `inspect | firmware` touches warning severity, UI copy, and report framing.
- Evidence pages are useful for debugging and should not be deleted too early.
- Gerber capability is a real product gap; UX copy must avoid overclaiming.
- Report and firmware builders need stronger evidence-tier language before they become final product outputs.
- AI review must stay secondary or users may believe it is doing deterministic engineering analysis.
- Progress UI must only use real completed work.

## Recommended implementation sequence

1. Product Realignment Phase B - Single Landing and Mode Workflow
   - Move mode selection and upload to `/`.
   - Keep `/intake` as temporary compatibility route.
   - Remove duplicated upload entry points.
   - No parser changes.

2. Product Realignment Phase C - Mode Orchestrator
   - Introduce `inspect` and `firmware`.
   - Connect mode to deterministic pipeline outputs.
   - Remove obsolete Basic/Analyze ambiguity.

3. Product Realignment Phase D - Real Gerber Capability Gap
   - Decide whether to implement Gerber/drill parsing or explicitly defer it.
   - Define evidence-tier behavior and wording.

4. Product Realignment Phase E - Single Processing Experience
   - Full-screen real processing flow.
   - Real progress calculation.
   - Professional transitions and alerts.

5. Product Realignment Phase F - Inspect Result
   - One inspection result with evidence, risks, recommendations, confidence, and export.

6. Product Realignment Phase G - Firmware Master Document
   - One firmware-development output with evidence-linked pin, peripheral, and connector maps.

7. Product Realignment Phase H - Route and Navigation Cleanup
   - Hide or deprecate duplicate pages.
   - Preserve advanced evidence routes internally where valuable.

8. Product Realignment Phase I - Final UI/UX and MVP Validation
   - Responsive, accessibility, performance, copy consistency, and end-to-end tests.

## Exact next phase scope

Next phase: Product Realignment Phase B - Single Landing and Mode Workflow.

Allowed:

- Move the primary mode selection and upload interface to `/`.
- Reuse current intake components.
- Keep `/intake` as a temporary compatibility route.
- Update navigation so the user starts at the single primary workflow.
- Keep parser, analysis, firmware, report, backend, AI, and normalized model logic unchanged.

Not allowed:

- Implement Architecture Phase G.
- Delete routes.
- Add parser capability.
- Change normalized project model.
- Change AI/backend behavior.
- Add dependencies.
- Create mock data or fake progress.

## Readiness verdict

| Area | Verdict | Explanation |
| --- | --- | --- |
| Core parser readiness | Partial | KiCad schematic, KiCad PCB, BOM CSV/TSV, and placement CSV/TSV are real; Gerber, drill, IPC, archive, and EasyEDA are not parsed. |
| Gerber-analysis readiness | Not ready | Current system only classifies Gerber-like files. No geometry or X2 attributes are extracted. |
| Schematic-analysis readiness | Partial | Schematic facts are parsed, but full connectivity, hierarchy aggregation, and formal logical checks are not implemented. |
| Cross-comparison readiness | Prototype | Some KiCad PCB/schematic net and pin evidence can be correlated, but no formal validation exists and Gerber contributes no content. |
| Firmware-generation readiness | Partial | Firmware manual is useful guidance from available evidence, but pin correctness and driver requirements remain uncertain. |
| Report readiness | Mostly ready | Engineering report is structured, evidence-linked, and exportable; it needs mode alignment and evidence-tier language. |
| AI-review readiness | Mostly ready | Consent-gated and based on deterministic report evidence; should be moved into final result as optional explanation. |
| UX readiness | Partial | Many good components exist, but the primary workflow is split across too many routes. |
| Production readiness | Not ready | Key manufacturing parsers, persistence, formal validation, and production hardening are missing. |
