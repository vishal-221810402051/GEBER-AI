# GEBER AI Route and Component Migration Plan

This plan classifies current files for the product realignment. It is documentation only and does not authorize deletion during Product Realignment Phase A.

Product Scope Override: the canonical MVP accepts only schematic files and Gerber/Gerber-package files as user inputs. Uploaded BOM, pick-and-place, IPC-356, native KiCad PCB, separate required drill input, EasyEDA, and optional advanced project evidence are no longer product inputs.

## Classification legend

- Keep unchanged: preserve behavior for now.
- Reuse internally: keep capability but remove from primary user journey.
- Refactor: change composition or public role.
- Merge: move behavior into another route or component.
- Hide from navigation: keep route available but remove primary nav exposure.
- Deprecate later: keep compatibility during migration.
- Remove only after migration: delete only after replacement is validated.

## Routes and pages

| File | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/pages/LandingPage.tsx` | Primary upload and public mode workflow | Keep unchanged for now | Phase B made this the operational landing intake. |
| `src/pages/IntakePage.tsx` | Compatibility redirect | Deprecate later | Redirects to `/`; keep during migration. |
| `src/pages/DashboardPage.tsx` | Broad project summary | Reuse internally, hide from navigation | Fold high-signal summary into `/result`; keep route temporarily for debugging. |
| `src/pages/BoardOverviewPage.tsx` | Legacy native PCB evidence | Deprecate later | Not canonical user input; keep only until routes are cleaned up. |
| `src/pages/ComponentsPage.tsx` | Component evidence tables | Refactor later | Must pivot to schematic-derived components and generated BOM evidence. |
| `src/pages/NetsPage.tsx` | Net inventory and exports | Refactor later | Must derive from schematic and parsed Gerber facts only. |
| `src/pages/PowerPage.tsx` | Power tree and rail evidence | Reuse internally, hide from navigation | Preserve as advanced evidence detail or report section. |
| `src/pages/BomPage.tsx` | Uploaded BOM table and export | Deprecate later | Uploaded BOM is not canonical; future BOM must be schematic-derived with unknown fields preserved. |
| `src/pages/FirmwarePage.tsx` | Firmware guidance | Merge | Become the Firmware mode `/result` surface or `/result/firmware` detail. |
| `src/pages/ReportsPage.tsx` | Engineering report and AI review | Merge | Become the Inspect mode `/result` surface or `/result/report` detail. |

## App and layout

| File | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/app/routes.tsx` | Route definitions | Refactor later | Add `/processing` and `/result` when their phases begin; keep old routes during migration. |
| `src/components/layout/AppLayout.tsx` | Shell and navigation | Keep unchanged for now | Phase B simplified primary navigation to Home while preserving direct advanced routes. |
| `src/components/status/StatusBanner.tsx` | Global capability banner | Refactor | Keep concise confidence language; avoid phase-history copy. |
| `src/components/errors/AppErrorBoundary.tsx` | Error boundary | Keep unchanged | Reuse for route-level errors. |

## Intake components

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/components/intake/UploadDropzone.tsx` | File upload UI | Refactor in Phase C | Limit public copy and readiness to schematic and Gerber/Gerber-package inputs. |
| `src/components/intake/PublicModeSelector.tsx` | Inspect/Firmware public mode UI | Keep unchanged for now | Added in Phase B; replaces public use of Basic/Analyze/Firmware. |
| `src/components/intake/IntakeModeSelector.tsx` | Legacy Basic/Analyze/Firmware mode UI | Deprecate later | No longer used by the public landing workflow; keep until Phase C removes internal ambiguity. |
| `src/components/intake/IntakeReadinessPanel.tsx` | Completeness and next readiness | Reuse internally | Move to landing page as compact readiness summary. |
| `src/components/intake/LandingReadinessSummary.tsx` | Landing readiness summary | Keep unchanged for now | Added in Phase B for compact public readiness. |
| `src/components/intake/LandingPrimaryAction.tsx` | Landing start action | Keep unchanged for now | Added in Phase B; routes to current `/reports` or `/firmware` compatibility outputs. |
| `src/components/intake/AdvancedEvidenceDisclosure.tsx` | Optional evidence capability disclosure | Remove in Phase C | Product Scope Override removes optional advanced evidence from public input. |
| `src/components/intake/FileInventoryGroup.tsx` | Grouped file inventory | Reuse internally | Keep below upload as compact grouped inventory. |
| `src/components/intake/ParserStatusAccordion.tsx` | Parser details | Reuse internally | Keep behind details; do not make primary above the fold. |
| `src/components/intake/ParserProgressTimeline.tsx` | Parser progress details | Reuse internally | Use in `/processing` only when useful. |
| `src/components/intake/IntakeNextActions.tsx` | Links to many routes | Refactor | Replace with one primary processing action. |

## Processing and UI components

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/components/ui/ProcessingOverlay.tsx` | Processing overlay | Reuse internally | Use as basis for full processing route. |
| `src/components/ui/RadialProgress.tsx` | Circular progress | Reuse internally | Use with real progress formula. |
| `src/components/ui/PipelineStepper.tsx` | Stage display | Reuse internally | Use with real workflow stages. |
| `src/components/ui/LoadingDots.tsx` | Loading indicator | Keep unchanged | Reuse only where motion is appropriate. |
| `src/components/ui/GlassAlert.tsx` | Alert system | Keep unchanged | Use for warnings/errors/success states. |
| `src/components/ui/GlassStatusCard.tsx` | Status cards | Reuse internally | Use sparingly; avoid default card wall. |

## Intake and workflow features

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/features/intake/useFileIntake.tsx` | Central file/mode/parser state | Refactor in Phase C | Introduce canonical `ProjectInputPackage` without requiring optional external evidence. |
| `src/features/intake/LandingIntakeWorkspace.tsx` | Shared landing intake workflow | Refactor in Phase C | Remove advanced evidence input and keep only schematic plus Gerber package intake. |
| `src/features/intake/publicModeAdapter.ts` | Temporary public-to-internal mode mapping | Refactor in Phase C | Keeps Inspect/Firmware UI isolated from legacy internal modes. |
| `src/features/intake/landingReadiness.ts` | Landing readiness gate | Refactor in Phase C | Inspect requires schematic plus Gerber presence; Firmware requires schematic only. |
| `src/features/intake/intakeTypes.ts` | Intake types | Refactor later | Replace `basic | analyze | firmware` with `inspect | firmware` in Phase C. |
| `src/features/intake/classifyFile.ts` | File classification | Refactor later | It may still classify legacy files, but public workflow must treat them as noncanonical. |
| `src/features/intake/completenessScore.ts` | Completeness scoring | Refactor in Phase C | Score only canonical schematic and Gerber evidence for public workflow readiness. |
| `src/features/intake/buildMissingDataWarnings.ts` | Missing evidence warnings | Refactor later | Align wording to Inspect/Firmware and evidence tiers. |
| `src/features/intake/buildParserStatus.ts` | Parser capability status | Refactor later | Replace stale phase copy; keep metadata-only truth. |
| `src/features/intake/groupFilesForDisplay.ts` | UI file grouping | Reuse internally | Use on landing upload inventory. |
| `src/features/intake/intakePipelineStages.ts` | Processing state | Refactor later | Use as base for real `/processing` model. |

## Parsers

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/features/parsers/kicadSchematic/` | KiCad schematic parser | Keep unchanged | Reuse in both modes. |
| `src/features/parsers/kicadPcb/` | Legacy native PCB parser | Keep unchanged, hide from public workflow | Not a canonical user-input dependency. |
| `src/features/parsers/bom/` | Legacy uploaded BOM parser | Keep unchanged, hide from public workflow | Future Inspect BOM must be generated from schematic evidence instead. |
| `src/features/parsers/placement/` | Legacy pick-and-place parser | Keep unchanged, hide from public workflow | Exact placement correlation is unavailable unless future Gerber attributes support it. |
| Gerber parser | Missing | Future D2-D5 implementation | Required for geometry, attributes, and physical correlation. |
| Schematic-derived BOM generator | Missing | Future D2-D5 implementation | Must preserve unknown fields and never invent missing values. |
| Drill parser | Missing | Do not require separately | Drill may be handled only as part of future Gerber/manufacturing capability. |
| IPC-356 parser | Missing | Noncanonical | Not a canonical user input. |
| Archive/EasyEDA parser | Missing | Noncanonical | Not a canonical user input. |

## Domain and normalization

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/domain/` | Core project model | Keep unchanged | Do not reshape during Phase B. |
| `src/features/normalization/buildNormalizedProject.ts` | Central normalized project builder | Keep unchanged for now | Later call from mode orchestrator without changing model first. |
| `src/features/evidence/` | Evidence register helpers | Keep unchanged | Reuse in final outputs. |

## Analysis features

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/features/analysis/` | Board, component, power, placement heuristics | Reuse internally | Keep deterministic and evidence-limited; expose through final report. |
| `src/features/nets/` | Net inventory and classification | Reuse internally | Keep as evidence source; do not overstate validation. |
| `src/features/power/` | Power tree helpers if present | Reuse internally | Keep as report evidence. |

## Output features

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/features/reporting/` | Engineering report builder | Refactor later | Make this the single Inspect output. |
| `src/features/firmware/` | Firmware manual builder | Refactor later | Make this the single Firmware output. |
| `src/features/export/` | Download/copy/CSV/export helpers | Keep unchanged | Reuse for final result actions. |

## AI and backend

| File or folder | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/features/ai/` | AI review UI and input builder | Reuse internally | Move optional action into final result. |
| `server/src/routes/aiReview.ts` | Consent-gated AI review endpoint | Keep unchanged | Do not alter backend in realignment UI phases. |
| `server/src/routes/capabilities.ts` | Backend capability route | Keep unchanged | Use to show optional AI availability. |
| `server/src/services/` | AI service layer | Keep unchanged | Preserve non-authoritative role. |

## CSS and visual system

| File | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/styles/globals.css` | Global visual system and route styles | Refactor gradually | Add landing/result/processing styles in scoped sections; avoid broad churn. |

## Documentation

| File | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `README.md` | Project overview | Refactor later | Update after workflow implementation begins. |
| `docs/GEBER_AI_PHASE_ROADMAP.md` | Historical roadmap | Refactor later | Add new realignment roadmap after Phase A or during Phase B if requested. |
| `docs/AI_REVIEW_PROTOTYPE.md` | AI review behavior | Keep unchanged | Reference AI role restrictions. |
| `docs/BACKEND_FOUNDATION.md` | Backend foundation | Keep unchanged | No backend changes in Phase A/B. |

## Tests

| File or group | Current role | Classification | Migration action |
| --- | --- | --- | --- |
| `src/test/intake.test.ts` | Intake classification/completeness tests | Refactor later | Update when landing becomes intake and mode changes. |
| `src/test/intakePipelineStages.test.ts` | Processing state tests | Refactor later | Update when real processing route/formula is introduced. |
| `src/test/kicadParsers.test.ts` | KiCad parser tests | Keep unchanged | Preserve parser behavior. |
| `src/test/tableParsers.test.ts` | BOM/placement tests | Keep unchanged | Preserve parser behavior. |
| `src/test/reportBuilder.test.ts` | Report builder tests | Refactor later | Expand around final Inspect result. |
| `src/test/buildAiReviewInput.test.ts` | AI evidence payload tests | Keep unchanged | Preserve no-raw-file behavior. |
| `server/src/routes/aiReview.test.ts` | AI backend tests | Keep unchanged | Preserve consent and validation behavior. |

## Phase-by-phase migration order

1. Phase B - Single Landing and Mode Workflow
   - Status: Complete.
   - Refactored `LandingPage`.
   - Reused intake components and shared file intake state.
   - Kept `/intake` compatibility through redirect.
   - Did not change parser logic.

2. Phase C - Mode Orchestrator
   - Replace `basic | analyze | firmware` with `inspect | firmware`.
   - Define `ProjectInputPackage` with only `schematicFiles` and `gerberFiles`.
   - Remove the public Advanced Evidence input section or mark it for immediate removal if UI sequencing requires a follow-up.
   - Select the report output for Inspect and firmware document output for Firmware.
   - Do not require uploaded BOM, placement, IPC, native PCB, EasyEDA, or separate drill input.
   - Do not implement Gerber parsing or schematic-derived BOM generation.
   - Keep normalized model stable unless a scoped contract-only type is needed.

3. Phase D2-D5 - Gerber and Schematic-Derived Output Capability
   - Implement or strengthen Gerber parsing in scoped phases.
   - Define and implement schematic-derived BOM generation.
   - Add evidence-tier restrictions for physical correlation.

4. Phase E - Single Processing Experience
   - Add `/processing`.
   - Use real progress formula.

5. Phase F - Inspect Result
   - Build `/result` for Inspect mode from report builder.

6. Phase G - Firmware Master Document
   - Build `/result` for Firmware mode from firmware builder.

7. Phase H - Route and Navigation Cleanup
   - Hide advanced pages from primary nav.
   - Keep compatibility paths until tests and user paths are stable.

8. Phase I - Final MVP Validation
   - Responsive, accessibility, performance, copy, route smoke tests, and final documentation.
