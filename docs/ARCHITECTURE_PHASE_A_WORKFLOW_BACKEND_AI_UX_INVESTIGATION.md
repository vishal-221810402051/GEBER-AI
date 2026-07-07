# GEBER AI Architecture Phase A - Workflow, Backend, AI, Loading UX, and Glass UI Investigation

## 1. Executive Diagnosis

GEBER AI is currently a client-side React, TypeScript, and Vite application with a mature deterministic MVP pipeline. The app can classify uploaded files, parse selected KiCad/BOM/placement inputs, build a normalized project, derive net inventory and heuristic analysis, generate firmware guidance, produce a structured engineering report, and export Markdown/JSON/CSV artifacts from browser state.

The architecture is intentionally local-first. There is no backend, API server, database, authentication layer, OpenAI integration, cloud upload, or persistence. This is good for demo privacy and deterministic review, but it prevents secure AI API integration, server-side report jobs, long-running work queues, and account/project persistence.

The main product gap is not deterministic capability. The gap is experience orchestration. The app still needs a cleaner processing model, better loading/progress feedback, unified glass alerts, smarter prioritization, and a future AI review layer that explains deterministic evidence without becoming the source of truth.

Recommendation: implement Architecture Phase B next as a UI infrastructure phase for loading, progress, and glass alert components. Keep the app frontend-only through that phase. Introduce a lightweight backend/BFF later only when AI review or secure server-only capabilities are explicitly approved.

## 2. Current Application Workflow Map

Current high-level workflow:

```txt
LandingPage
  -> AppLayout grouped navigation
  -> IntakePage
  -> UploadDropzone
  -> useFileIntake
  -> classifyFile
  -> File.text() browser reads
  -> parseKicadPcb / parseKicadSchematic / parseBom / parsePlacement
  -> buildNormalizedProject
  -> buildParserStatus
  -> buildProjectEvidence
  -> buildMissingDataWarnings
  -> buildNetInventory
  -> buildBoardAnalysis
       -> buildComponentRoles
       -> buildDecouplingAnalysis
       -> buildPullResistorAnalysis
       -> buildPlacementAnalysis
       -> buildPowerTreeAnalysis
  -> buildFirmwareManual
       -> detectMcuCandidates
       -> buildFirmwarePinMap
       -> buildPeripheralMap
       -> buildConnectorMap
       -> buildDriverSuggestions
       -> buildFirmwareChecklist
       -> buildFirmwareSafetyNotes
  -> buildEngineeringReport
       -> buildRiskMatrix
       -> buildRecommendations
       -> buildConfidenceSummary
       -> buildReportSections
       -> buildReportMarkdown
  -> UI pages
       -> Dashboard / Board / Components / Nets / Power / BOM / Firmware / Reports
  -> export helpers
       -> downloadTextFile / copyTextToClipboard / tableToCsv / toPrettyJson
```

### Stage 1 - User opens landing/home page

Modules: `src/pages/LandingPage.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/status/StatusBanner.tsx`, `src/app/routes.tsx`.

Inputs: browser route state.

Outputs: home screen, grouped navigation, capability/status banner.

Execution: synchronous render.

Loading state: none needed for static render.

Error state: app-level error boundary catches render errors.

Progress state: none.

Verbosity/internal detail: Phase B made the home page more compact; the app still has many route choices.

Deterministic: yes.

AI fit: no AI needed.

AI should not: generate routes, capabilities, or product state.

Risks: landing can still be less direct than a single upload-first experience.

### Stage 2 - User enters intake

Modules: `src/pages/IntakePage.tsx`, `src/components/intake/*`, `src/features/intake/groupFilesForDisplay.ts`.

Inputs: current file intake context.

Outputs: upload command area, readiness panel, mode selector, grouped inventory, parser status accordion, next actions.

Execution: synchronous render plus derived memoized grouping.

Loading state: no true loading indicator for pending file parsing.

Error state: row diagnostics and app error boundary.

Progress state: parser status cards exist, but no timed or animated pipeline.

Verbosity/internal detail: much improved after Frontend Phase C; diagnostics and evidence are collapsed by default.

Deterministic: yes.

AI fit: later AI can explain next steps after deterministic summary exists.

AI should not: decide file type or parse file content.

Risks: async parser execution is not visually obvious; large file reads may appear frozen.

### Stage 3 - User uploads multiple files

Modules: `UploadDropzone`, `useFileIntake.addFiles`, browser `FileList`.

Inputs: browser `File` objects.

Outputs: classified file records in React state.

Execution: event-driven synchronous state update for classification.

Loading state: none.

Error state: no explicit file read failure alert at selection time.

Progress state: none.

Verbosity/internal detail: grouped inventory hides raw notes by default.

Deterministic: classification is deterministic based on filename/extension patterns.

AI fit: no. AI should not classify file types because deterministic extension/name handling is safer.

AI should not: inspect proprietary raw files for classification.

Risks: duplicate IDs are based on name, size, and lastModified; browser memory and responsiveness are not surfaced.

### Stage 4 - File classification

Modules: `src/features/intake/classifyFile.ts`, `intakeTypes.ts`, `completenessScore.ts`.

Inputs: filename, size, MIME type, extension.

Outputs: `ClassifiedFile`, file category, confidence, completeness contribution, readiness score.

Execution: synchronous.

Loading state: none.

Error state: unknown/unsupported category.

Progress state: none needed.

Verbosity/internal detail: old phase notes still exist inside classifier notes, but Phase C does not expose them as primary UI.

Deterministic: yes.

AI fit: no.

AI should not: override deterministic classification.

Risks: ambiguous CSV and archive classification remains heuristic.

### Stage 5 - File reading

Modules: `useFileIntake.tsx` effects, browser `File.text()`.

Inputs: selected `File` objects for KiCad PCB, KiCad schematic, BOM, and placement categories.

Outputs: text passed into parser functions; fallback empty parse result on read failure.

Execution: asynchronous Promise flow inside React effects.

Loading state: no explicit per-file reading indicator.

Error state: read failure is caught and converted into parser output from empty input; user sees diagnostics, not a distinct read-failure alert.

Progress state: none.

Verbosity/internal detail: diagnostics are collapsed in intake but visible in detailed pages.

Deterministic: read behavior is browser-provided; parser fallback is deterministic.

AI fit: no.

AI should not: receive raw file content by default.

Risks: no cancellation UI, no progress meter, large files can block user trust.

### Stage 6 - Parser execution

Modules:

- `src/features/parsers/kicad-pcb/parseKicadPcb.ts`
- `src/features/parsers/kicad-schematic/parseKicadSchematic.ts`
- `src/features/parsers/bom/parseBom.ts`
- `src/features/parsers/placement/parsePlacement.ts`
- shared delimited parser utilities.

Inputs: file text, source file ID, source filename.

Outputs: parser result records keyed by classified file ID.

Execution: asynchronous in effect chain, but parser functions themselves are synchronous once text exists.

Loading state: no per-parser spinner or progress timeline.

Error state: parser diagnostics and `success` flags; invalid S-expressions become diagnostics.

Progress state: no visible stepper.

Verbosity/internal detail: parser details are still present but better collapsed in intake.

Deterministic: yes.

AI fit: no. AI should not replace parsers.

AI should not: parse KiCad, BOM, placement, or Gerber content.

Risks: parser support is partial; spreadsheet BOM parsing is recognized but unsupported; Gerber/drill/IPC/EasyEDA content parsing is not complete.

### Stage 7 - Normalized project creation

Modules: `src/features/project-model/buildNormalizedProject.ts`, `projectModelTypes.ts`, `src/domain/project.ts`.

Inputs: classified files, completeness, mode, parser result maps.

Outputs: `NormalizedPCBProject` with source files, parser status, warnings, evidence, board/schematic/BOM/placement models, net inventory, analysis, firmware, report.

Execution: synchronous memoized computation in `useFileIntake`.

Loading state: none.

Error state: no local try/catch; app error boundary catches render-level failures.

Progress state: none.

Verbosity/internal detail: model still contains phase-era message strings and only chooses the first successful schematic/PCB/BOM/placement for normalized model surfaces.

Deterministic: yes.

AI fit: no for construction. AI can later consume a minimized summary of this model.

AI should not: reshape or infer normalized facts.

Risks: large synchronous model rebuilds can affect responsiveness; multi-schematic aggregation is not yet modeled.

### Stage 8 - Missing-data warnings

Modules: `src/features/project-model/buildMissingDataWarnings.ts`, `src/domain/warnings.ts`.

Inputs: files, selected mode, parser/model state.

Outputs: `MissingDataWarning[]`.

Execution: synchronous.

Loading state: none.

Error state: warnings are data, not UI errors.

Progress state: none.

Verbosity/internal detail: warnings appear across many pages and can feel repetitive.

Deterministic: yes.

AI fit: yes for explanation and prioritization after warnings exist.

AI should not: invent missing files or suppress deterministic warnings.

Risks: warning fatigue if every page repeats limitations.

### Stage 9 - Net inventory

Modules: `src/features/net-explorer/*`, `src/domain/nets.ts`.

Inputs: parsed PCB nets/pads and schematic labels.

Outputs: normalized net inventory, classifications, diagnostics, summaries.

Execution: synchronous inside normalized project build.

Loading state: none.

Error state: diagnostics.

Progress state: none.

Verbosity/internal detail: `/nets` still exposes many columns and detailed panels.

Deterministic: yes, name/pattern-based.

AI fit: yes for explaining why a net is classified a certain way, but only by citing evidence.

AI should not: reclassify nets without deterministic evidence.

Risks: name-based classification can appear more certain than it is.

### Stage 10 - Decoupling and pull-resistor analysis

Modules: `src/features/analysis/decoupling/*`, `src/features/analysis/pull-resistors/*`, shared component role and net helpers.

Inputs: footprints, component roles, net inventory.

Outputs: heuristic decoupling candidates/findings and pull resistor candidates/requirements/findings.

Execution: synchronous.

Loading state: none.

Error state: missing evidence findings.

Progress state: none.

Verbosity/internal detail: can become dense on components/nets/dashboard.

Deterministic: yes.

AI fit: yes for engineering-language explanation and prioritization.

AI should not: claim actual electrical correctness or datasheet validation.

Risks: heuristics can be mistaken for confirmed design errors if copy is too strong.

### Stage 11 - Placement and power-tree analysis

Modules: `src/features/analysis/placement/*`, `src/features/analysis/power-tree/*`.

Inputs: PCB layout, placement table, BOM, net inventory, component roles, power/ground nets.

Outputs: placement components/findings, rails, regulators, inputs, budgets, power findings.

Execution: synchronous.

Loading state: none.

Error state: findings and limitations.

Progress state: none.

Verbosity/internal detail: `/power` and `/board` present many panels/tables.

Deterministic: yes.

AI fit: yes for explaining risk and next manual review actions.

AI should not: verify regulator sizing, thermal margin, power integrity, or datasheet correctness.

Risks: unknown current loads and guessed regulator candidates require careful confidence language.

### Stage 12 - Firmware manual generation

Modules: `src/features/firmware/*`, `src/domain/firmware.ts`.

Inputs: normalized schematic/PCB evidence, nets, roles, analysis outputs.

Outputs: firmware manual, MCU candidates, pin map, peripherals, connectors, driver suggestions, checklist, safety notes, bring-up.

Execution: synchronous.

Loading state: none.

Error state: unavailable/limited readiness states.

Progress state: none.

Verbosity/internal detail: `/firmware` is still long and mostly expanded.

Deterministic: yes.

AI fit: yes for explaining firmware starting points to an engineer and summarizing limitations.

AI should not: create firmware pin mappings beyond deterministic evidence or claim datasheet facts.

Risks: firmware guidance is easy to over-trust without datasheet review.

### Stage 13 - Engineering report generation

Modules: `src/features/report/*`, `src/domain/report.ts`.

Inputs: normalized project, warnings, analysis, firmware, net inventory.

Outputs: engineering report, executive summary, risks, recommendations, confidence summary, evidence register, limitations, Markdown.

Execution: synchronous.

Loading state: none.

Error state: report unavailable empty state when no files exist.

Progress state: none.

Verbosity/internal detail: `/reports` is high-value but long and dense.

Deterministic: yes.

AI fit: yes for narrative interpretation, prioritization, follow-up questions, and audience-specific explanation.

AI should not: change risk IDs, findings, evidence, or confidence facts.

Risks: report generation can feel like validation if not framed correctly.

### Stage 14 - Export generation

Modules: `src/features/export/*`, export calls in pages.

Inputs: current parsed/report data.

Outputs: text files via Blob/download, clipboard copy, browser print flow.

Execution: synchronous for downloads/CSV/JSON/Markdown; clipboard is async.

Loading state: none.

Error state: `ExportResult` message, local `exportStatus` state on reports.

Progress state: none.

Verbosity/internal detail: export buttons are scattered across pages.

Deterministic: yes.

AI fit: no for core export. AI may later draft commentary included in a separate AI review output.

AI should not: rewrite deterministic export values.

Risks: browser print is not server-side PDF; no export progress or toast system.

### Stage 15 - UI presentation

Modules: all page components under `src/pages`, shared layout/status/page header, global CSS.

Inputs: `useFileIntake` context and derived project model.

Outputs: route UI, empty states, warning panels, tables, cards, buttons.

Execution: synchronous React render.

Loading state: weak to absent.

Error state: error boundary plus route empty states and parser diagnostics.

Progress state: none beyond static parser statuses.

Verbosity/internal detail: still too much raw detail on result pages.

Deterministic: yes.

AI fit: yes as an optional explanation layer, not presentation source of truth.

AI should not: replace deterministic UI facts.

Risks: current page count and dense tables can overwhelm non-expert users.

## 3. Current Frontend/Backend Boundary

Current frontend:

- React 19, TypeScript, Vite, React Router.
- npm package manager.
- Browser-only local state through `FileIntakeProvider`.
- Browser `File.text()` for selected files.
- Deterministic parser, analysis, firmware, report, and export code in the frontend bundle.
- Client-side exports through Blob, clipboard, JSON/CSV/Markdown, and browser print.

Current backend:

- None.
- No Express, Fastify, server directory, API routes, database, auth, job queue, cloud upload, or persistence.

Current OpenAI/AI integration:

- None.
- No AI package, AI endpoint, prompt, OpenAI model call, or structured output validation.

Secret/API key scan:

- No application source references to `OPENAI_API_KEY`, `process.env`, `import.meta.env`, bearer tokens, or `sk-` style keys were found.
- Search hits for `express` were package-lock metadata URLs only, not installed backend code.

## 4. Current Bottlenecks

- No visible async processing lifecycle for file reads and parser effects.
- No progress indicator for multi-file parsing.
- No unified alert component, so warnings, empty states, parser failures, and export status all use different patterns.
- Result pages still expose dense data tables and repeated limitations.
- Normalized project creation is synchronous and can rebuild large derived structures in the browser.
- Multi-schematic display exists in intake, but normalized model aggregation still selects one successful schematic for downstream project model surfaces.
- Export status is page-local and not standardized.
- No backend means no secure AI API, no project persistence, no server-side PDF/report jobs, and no queue for long-running work.
- AI is absent, so the product cannot yet provide founder-level, firmware-level, or review-priority explanations.

## 5. Loading/Progress UX Gap Analysis

Required processing states and current gaps:

- File reading: async in `useFileIntake`, no visible reading state.
- File classification: synchronous, no spinner needed; could show a brief "classified" completion state.
- KiCad PCB parsing: parser result appears after async file read, no active parser progress.
- KiCad schematic parsing: same; multi-file state is represented but no per-file progress timeline.
- BOM parsing: no active parse state.
- Placement parsing: no active parse state.
- Net inventory building: synchronous derived state, no progress or completion pulse.
- Decoupling analysis: synchronous derived state, no processing state.
- Pull resistor analysis: synchronous derived state, no processing state.
- Placement analysis: synchronous derived state, no processing state.
- Power-tree analysis: synchronous derived state, no processing state.
- Firmware manual generation: synchronous derived state, no processing state.
- Report generation: synchronous derived state, no processing state.
- Export generation: immediate action with status text; no toast/progress.
- Future AI review: no state yet; will require queued/running/succeeded/failed/cancelled states.

Recommended components:

- `ProcessingOverlay`: modal or page-level glass overlay for long-running local/AI operations.
- `RadialProgress`: circular progress or indeterminate radial motif for premium processing states.
- `PipelineStepper`: route-level pipeline summary from upload to report.
- `LoadingDots`: subtle inline activity indicator for small pending states.
- `GlassStatusCard`: reusable status tile with info/success/warning/error styling.
- `ParserProgressTimeline`: per-parser and per-file status timeline.
- `AsyncStageIndicator`: small stage badge for `waiting`, `reading`, `parsing`, `complete`, `warning`, `failed`.

Recommendation: Architecture Phase B should implement these components without changing parser logic. Initial stage states can be derived from existing `files`, parser result maps, and parser diagnostics.

## 6. Alert/Error UX Gap Analysis

Current alert surfaces:

- `notice-panel` and `notice-panel warning` across Board, BOM, Components, Nets, Power, Firmware, Reports.
- `empty-state` for missing route inputs.
- `status-pill` for severity, confidence, parser status, and generic state.
- `AppErrorBoundary` for app render failures.
- Parser diagnostics inside route sections and intake details.
- Export status text in Reports.

Gaps:

- No unified variant model for info/success/warning/error/critical.
- Missing-data warnings look similar to ordinary notices.
- Parser failure and unsupported files do not have a consistent critical/error treatment.
- Export failure messages are text-only, not standardized alerts.
- Empty states are visually close to warnings even when they are normal.

Proposed component:

```ts
type GlassAlertProps = {
  variant: "info" | "success" | "warning" | "error" | "critical";
  title: string;
  message: string;
  action?: React.ReactNode;
  evidence?: string[];
  compact?: boolean;
};
```

Replacement audit:

- Global status banner: `GlassAlert` info compact.
- Intake firmware evidence warning: `GlassAlert` warning compact.
- Parser failed routes: `GlassAlert` error with diagnostics action.
- Unsupported BOM spreadsheet: `GlassAlert` warning/error depending on parser result.
- Missing route inputs: `GlassAlert` info plus primary action.
- Reports evidence caveat: `GlassAlert` warning compact.
- Export success/failure: `GlassAlert` success/error toast or inline status.
- App error boundary: `GlassAlert` critical.

## 7. Backend Architecture Options

### Option A - Keep client-side only

Pros:

- Simplest architecture.
- Best current privacy posture.
- No server cost.
- Easy local demo and static deployment.
- No API key exposure risk because no API key exists.
- Deterministic local pipeline remains transparent.

Cons:

- No secure AI API integration.
- Browser performance limits for large projects.
- No persistence or user accounts.
- No job queue.
- No server-side report/PDF generation.
- No rate limiting or centralized audit trail.

Best use:

- Next UI infrastructure phases.
- Demo/MVP where local-only processing is a product strength.

### Option B - Add lightweight backend/BFF

Recommended shape:

- Node.js + TypeScript backend-for-frontend.
- Prefer Fastify for typed schema-friendly request validation and performance, or Express if team familiarity is higher.
- Separate `server/` or `backend/` package only when approved.

Responsibilities:

- Store `OPENAI_API_KEY` server-side only.
- Receive structured project summaries, not raw files by default.
- Enforce request size limits and rate limits.
- Call OpenAI for AI review/ask features.
- Validate structured AI output.
- Return evidence-linked AI review result.
- Optionally support server-side report/PDF jobs later.

Pros:

- Secure OpenAI API integration.
- Keeps deterministic frontend pipeline as source of truth.
- Smaller than full worker architecture.
- Can be introduced without file upload handling.

Cons:

- Adds deployment and operational complexity.
- Needs privacy disclosures, consent UI, rate limiting, and secret management.
- Still no full persistence/job queue unless added deliberately.

Best use:

- First AI review prototype after loading/alert UI is in place.

### Option C - Worker/backend pipeline

Responsibilities:

- Upload raw files.
- Parser worker jobs.
- AI review jobs.
- Report jobs.
- Storage.
- Queue.
- Database.
- Authentication and project persistence.

Pros:

- Production-capable architecture for large projects and multi-user workflows.
- Enables persistence, background processing, and server-side reports.

Cons:

- Too heavy for immediate MVP.
- Highest privacy/security burden.
- Risks slowing product iteration.

Best use:

- Later production version after backend/BFF and AI prototype prove value.

Recommendation: keep client-side only for Architecture Phase B and C. Introduce Option B as Architecture Phase D if explicitly approved. Defer Option C until there is a clear production requirement for persistence, queues, accounts, and server-side parsing.

## 8. AI Intelligence Options

Core rule: deterministic parsers and deterministic analysis remain the source of truth. AI is a reviewer/explainer, not an authority.

AI must not replace:

- KiCad parser.
- BOM parser.
- Net parser.
- Component role detection.
- Decoupling heuristics.
- Pull-up/pull-down heuristics.
- Power tree builder.
- Firmware map builder.
- Evidence register.
- Risk matrix builder.

AI can help with:

- Explaining findings in professional language.
- Prioritizing risks for different audiences.
- Asking follow-up questions.
- Generating cleaner report narrative.
- Suggesting next files needed.
- Suggesting likely review steps.
- Summarizing confidence limitations.
- Explaining firmware pin/net evidence.
- Translating deterministic report detail for founders, firmware engineers, or manufacturing reviewers.

### AI Review Mode

Possible buttons:

- `Run AI Review`
- `Generate Engineering Interpretation`
- `Ask GEBER AI`
- `Explain Findings`

Input: structured JSON summary generated from deterministic state.

Output: structured AI review with evidence IDs and limitations.

Best first feature: `Generate Engineering Interpretation` from the deterministic engineering report.

### AI Chat / Ask Mode

Useful questions:

- What is risky in this board?
- What files are missing?
- What should firmware start with?
- Why is this net classified as I2C?
- What should I check before manufacturing?
- Explain this report for a founder.
- Explain this report for a firmware engineer.

Rules:

- Cite evidence IDs from deterministic report.
- Say when data is missing.
- Do not invent components, nets, datasheet facts, validation state, or production readiness.
- Respond from structured project evidence only.

Recommendation: do AI Review Mode before chat. Chat has more room for unsupported claims and needs stricter retrieval/context control.

## 9. AI Safety and Privacy Rules

Required rules:

- Never put OpenAI API keys in React/Vite frontend.
- Never commit API keys.
- Use server-side `OPENAI_API_KEY` only.
- Add `.env.example`, not `.env`.
- Ensure `.env` is gitignored before backend work.
- Require explicit user consent before any AI request.
- Default to "send structured evidence only".
- Do not send raw design files by default.
- Provide local-only deterministic mode that works without AI.
- Treat deterministic analysis as source of truth.
- Require AI to cite evidence IDs.
- Require AI to separate facts, inferences, assumptions, and limitations.
- Refuse unsupported claims.
- Do not allow AI to claim certification, board validation, production readiness, firmware readiness, datasheet compliance, or schematic-to-PCB match unless deterministic code and source data explicitly support it.

## 10. Recommended OpenAI API Integration Architecture

Recommended future architecture:

```txt
React/Vite frontend
  -> deterministic parsers and analysis run locally
  -> user opens AI consent panel
  -> frontend builds AiReviewRequest from structured report/evidence only
  -> POST /api/ai/review to backend/BFF
  -> backend validates request size and schema
  -> backend calls OpenAI with server-side OPENAI_API_KEY
  -> backend validates structured JSON output
  -> frontend displays AiReviewResult with evidence links and limitations
```

Backend choice:

- Prefer Fastify + TypeScript for schema validation and typed request boundaries.
- Express is acceptable if simplicity/team familiarity matters more.
- Do not add backend until Architecture Phase D approval.

Do not send:

- Raw KiCad files by default.
- Full BOM line content unless needed and consented.
- Proprietary notes beyond structured evidence summary.

Send:

- Project metadata.
- Completeness score.
- Parser status.
- Evidence register.
- Risk matrix.
- Recommendations.
- Missing-data warnings.
- Firmware manual summary.
- Export/report summary.

## 11. Data Flow for AI Review

```txt
NormalizedPCBProject
  -> EngineeringReport
  -> AiReviewInputBuilder
  -> User consent modal
  -> Backend /api/ai/review
  -> OpenAI structured output
  -> AiReviewResult
  -> AI Review panel
  -> optional report narrative appendix
```

Important: the AI output should be stored/displayed as interpretation, not merged into deterministic findings.

## 12. Proposed AI JSON Input/Output Contracts

Proposed input:

```ts
type AiReviewInput = {
  project: {
    id: string;
    name: string;
    selectedMode: string;
    sourceFileCount: number;
    completenessScore: number;
    readinessLabel: string;
  };
  parserStatus: {
    stages: {
      id: string;
      label: string;
      status: string;
      confidence: string;
      fileCount: number;
      message: string;
    }[];
  };
  evidenceRegister: {
    evidenceId: string;
    source: string;
    detail: string;
    confidence: string;
  }[];
  riskMatrix: {
    highestSeverity: string;
    risks: {
      id: string;
      title: string;
      severity: string;
      confidence: string;
      category: string;
      evidenceIds: string[];
      recommendation: string;
      limitation: string;
    }[];
  };
  recommendations: {
    id: string;
    priority: string;
    category: string;
    title: string;
    requiredAction: string;
  }[];
  missingDataWarnings: {
    id: string;
    title: string;
    severity: string;
    requiredFiles: string[];
    message: string;
  }[];
  firmwareSummary?: {
    readiness: string;
    mcuCandidates: number;
    pinMapEntries: number;
    peripheralGroups: number;
    limitations: number;
  };
  constraints: {
    noValidationClaims: true;
    citeEvidenceIds: true;
    structuredEvidenceOnly: true;
  };
};
```

Proposed output:

```ts
type AiReviewResult = {
  summary: string;
  topRisks: AiRiskInterpretation[];
  questionsForEngineer: string[];
  nextActions: string[];
  confidenceNotes: string[];
  reportNarrative: string;
  limitations: string[];
};

type AiRiskInterpretation = {
  riskId: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low" | "informational";
  evidenceIds: string[];
  explanation: string;
  recommendedAction: string;
  confidence: string;
};
```

Prompt rules:

- Use only provided JSON.
- Cite risk IDs and evidence IDs.
- State missing data clearly.
- Refuse production-ready, validated, certified, datasheet-compliant, or electrically validated claims.
- Do not introduce components, nets, values, files, or datasheet facts not present in input.

## 13. Proposed Glassmorphism UI System

Design direction:

- Dark graphite app base.
- Gray glass panels with translucent borders.
- Orange active/process accent.
- Green success/ready states.
- Amber/orange warning states.
- Red error/critical states.
- Minimal text by default.
- Collapsed detail panels.
- Clear next action.
- Subtle blur/glow, no cartoon spinners, no heavy neumorphism.

Tokens to formalize:

- `--glass-bg`
- `--glass-bg-strong`
- `--glass-border`
- `--glass-shadow`
- `--glass-blur`
- `--success-glass`
- `--warning-glass`
- `--error-glass`
- `--critical-glass`
- `--process-accent`

Recommended surfaces:

- `GlassPanel`
- `GlassStatusCard`
- `GlassAlert`
- `GlassToolbar`
- `GlassDrawer`
- `GlassMetric`

## 14. Proposed Loading/Progress Component System

Components:

- `ProcessingOverlay`: page-level overlay for long operations.
- `RadialProgress`: premium circular progress/indeterminate loader.
- `PipelineStepper`: upload -> classify -> parse -> normalize -> analyze -> report -> export.
- `LoadingDots`: inline pending state.
- `ParserProgressTimeline`: per-file parser stage list.
- `AsyncStageIndicator`: badge for waiting/reading/parsing/complete/warning/failed.
- `SkeletonCard`: loading placeholder for cards/tables.

Initial implementation should derive states from existing data:

- no files: waiting
- files present without parser result: recognized/reading/parsing
- parser result success: complete
- parser diagnostics high/critical: warning/error
- unsupported: unsupported
- report available: complete

No parser algorithm changes are required.

## 15. Proposed Alert Component System

`GlassAlert` variants:

- `info`: neutral glass, low intensity.
- `success`: green glass, use only for completed/ready states.
- `warning`: amber/orange glass, missing data or limited confidence.
- `error`: red glass, parser failure, invalid file, export failure, file read failure.
- `critical`: dark crimson glass, mode-blocking or app-level failure.

Proposed props:

```ts
type GlassAlertProps = {
  variant: "info" | "success" | "warning" | "error" | "critical";
  title: string;
  message: string;
  action?: React.ReactNode;
  evidence?: string[];
  compact?: boolean;
};
```

Use cases:

- App error boundary: critical.
- Parser failure: error.
- Unsupported spreadsheet: warning or error depending actionability.
- Missing schematic/PCB for firmware: warning.
- Local-only privacy notice: info.
- Export completed: success.
- Export failed: error.

## 16. Recommended Simplified Application Workflow

Recommended MVP direction: Option C, Smart Review Workspace, but implemented gradually.

Target hierarchy:

1. Upload
2. Processing
3. Evidence
4. Findings
5. Report / Firmware
6. Export

Route recommendation:

- Short term: keep current routes to avoid churn.
- Phase B/C architecture work: add shared processing and alert systems.
- Later smart workspace: combine Board, Components, Nets, Power, and BOM into a Review Workspace with tabs.
- Keep Firmware and Reports as Outputs.

Evaluation:

- Option A, keep current routes: lowest risk, but still too many surfaces.
- Option B, workspace model: simpler but may hide useful engineering detail.
- Option C, smart review workspace: best MVP direction because it preserves detail while creating a clearer flow.

## 17. Recommended Implementation Sequence

### Architecture Phase B - Loading, Alert, and Glass UI System

- Add `GlassAlert`.
- Add `ProcessingOverlay`.
- Add `RadialProgress`.
- Add `PipelineStepper`.
- Add `GlassStatusCard`.
- Add consistent loading/error states.
- No backend.
- No AI.
- No parser changes.

### Architecture Phase C - Processing Pipeline UX Integration

- Add parser progress timeline to intake.
- Add loading states to file reading and parser result transitions.
- Add success/error status transitions.
- Keep deterministic local processing.

### Architecture Phase D - Backend Foundation

- Add lightweight backend/BFF only if approved.
- Use server-side API key handling.
- Add `.env.example` and ensure `.env` is ignored.
- Add request size/rate limits.
- No AI calls until explicit approval.

### Architecture Phase E - AI Review Prototype

- Backend AI endpoint.
- Structured report JSON input.
- Structured JSON output validation.
- Evidence-linked AI review.
- User consent before sending data.
- No raw design files by default.

### Architecture Phase F - Smart Review Workspace

- Simplify pages into evidence/review/report flow.
- Move Board, Components, Nets, Power, and BOM into a tabbed review workspace.
- Keep Reports and Firmware as primary outputs.

## 18. Risks

- UI may become visually premium but still cognitively dense if details are not collapsed.
- Loading indicators can imply longer background jobs than actually exist unless tied to real state.
- Browser-only parsing can freeze on large files without workerization.
- AI can create false confidence unless constrained to structured evidence and evidence IDs.
- Sending PCB summaries to AI still has privacy implications even without raw files.
- Backend introduction increases deployment, security, and maintenance burden.
- Report and firmware outputs can be mistaken for validation if AI wording is not tightly constrained.
- Current normalized model does not aggregate multi-schematic hierarchy across all schematic files.
- Some internal phase strings remain in model/report data and should be cleaned in future copy passes.

## 19. Exact Next Phase Scope

Next phase: Architecture Phase B - Loading, Alert, and Glass UI System.

Allowed:

- Add reusable `GlassAlert`.
- Add reusable loading/progress components.
- Add glass status cards.
- Add component-level styles/tokens for info/success/warning/error/critical states.
- Wire a small number of existing notices/empty states to the new components if explicitly scoped.

Not allowed:

- Backend implementation.
- OpenAI API calls.
- API keys or `.env` secrets.
- Parser logic changes.
- Analysis logic changes.
- Firmware logic changes.
- Report generation changes.
- Export logic changes.
- Route reorganization.
- AI review implementation.
