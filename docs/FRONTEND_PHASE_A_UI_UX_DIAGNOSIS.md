# GEBER AI Frontend Phase A - UI/UX Diagnosis and Intake Redesign Lock

## 1. Executive frontend diagnosis

The current frontend is a working React + TypeScript + Vite application with all requested MVP routes present. It has grown phase by phase into a capable engineering prototype, but the visible experience now carries too much historical phase language, repeated warnings, and dense diagnostic detail.

The main frontend problem is not missing capability. The problem is information hierarchy. Users see many panels before they can answer the core questions: what files were loaded, what evidence is available, what is risky, what can be exported, and what should be done next.

Phase A recommends preserving the current feature architecture while simplifying the shell, intake workflow, navigation, page headers, warning presentation, and route-level density in later frontend phases.

## 2. Current frontend map

Framework: React 19 with TypeScript, Vite, and React Router.

Package manager: npm, with `package-lock.json` expected for dependency lock state.

Scripts:

- `npm.cmd run dev`
- `npm.cmd run build`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run test:watch`

Top-level source folders:

- `src/app`: app entry and route configuration.
- `src/components`: layout, status, card, and error boundary components.
- `src/domain`: core project/domain types and deterministic model structures.
- `src/features`: intake, parsing, normalization, analysis, reporting, and export helpers.
- `src/pages`: route-level page components.
- `src/styles`: global CSS.
- `src/test`: automated tests.

Routes audited:

- `/`: `LandingPage`
- `/intake`: `IntakePage`
- `/dashboard`: `DashboardPage`
- `/board`: `BoardOverviewPage`
- `/components`: `ComponentsPage`
- `/nets`: `NetsPage`
- `/power`: `PowerPage`
- `/bom`: `BomPage`
- `/firmware`: `FirmwarePage`
- `/reports`: `ReportsPage`

Shared frontend components audited:

- `AppLayout`: global shell, topbar, sidebar navigation, status placement.
- `StatusBanner`: global phase/status banner.
- `PlannedCard`: reusable placeholder-style card still used on landing and dashboard.
- `AppErrorBoundary`: route error surface.
- `PageHeader`: repeated route heading pattern.

Global styling audited:

- `src/styles/globals.css` defines the dark app shell, topbar, sidebar, cards, summary panels, notice panels, table grids, filter bars, responsive behavior, and print styles.

## 3. Main UX problems

1. Stale phase status is visible in the shell.
   `AppLayout` still shows `Phase 1`, `Upload not active`, and `Parser not implemented`, while later parser, analysis, firmware, report, and export phases exist.

2. The global status banner contradicts current capability.
   `StatusBanner` says `Phase 1 shell only` while also referencing later phase behavior.

3. Intake is overloaded.
   `/intake` combines upload, accepted file type education, mode selection, missing file warnings, parser summaries, normalized project preview, phase status panels, diagnostics, warnings, evidence, assumptions, and readiness messages.

4. Phase history is exposed as product UX.
   Page copy repeatedly says `Phase 4`, `Phase 5`, `Phase 6`, `Phase 7`, `Phase 8`, `Phase 9`, `Phase 10`, and `Phase 11`. This is useful for development but not for the user-facing MVP.

5. Warnings are accurate but repeated too often.
   Nearly every page includes a notice that results are not validation. This is correct, but it should be consolidated into a page-level limitations disclosure or persistent confidence language.

6. Tables are dense and wide.
   Components, BOM, nets, firmware, power, and reports use grid tables with many columns. This makes scanning hard and increases responsive risk.

7. Dashboard duplicates detail from every page.
   `/dashboard` presents summaries for parsing, tables, nets, analysis, firmware, report, and planned cards. It should become a compact command center, not a second full report.

8. Navigation is flat.
   Ten routes are shown at the same level. Overview, Intake, Dashboard, Board, Components, Nets, Power, BOM, Firmware, and Reports need clearer grouping.

9. Operational pages overuse panels.
   `summary-panel`, `notice-panel`, `model-panel`, `stage-list`, and `tag-list` appear heavily. The result is visually repetitive and harder to prioritize.

10. Some empty states and descriptions are outdated.
   Several empty states still refer to future work that has since been implemented.

## 4. Page-by-page audit

### `/` Overview

Current role: landing page and product promise.

Useful:

- Clear brand.
- Direct link to intake.
- Mentions direct facts versus inferred findings.

Problems:

- Still says `Phase 1`.
- Still says upload, parser, analysis, and reports are not implemented.
- Uses planned cards even though the app now has working intake, parsers, analysis, firmware guidance, reports, and exports.
- Reads like a Phase 1 landing page rather than a mature app home.

Recommendation:

- Convert into a compact project home or redirect users toward `/intake` and `/dashboard`.
- Remove stale implementation-status copy.
- Keep only a short product identity and first action.

### `/intake`

Current role: local file selection, classification, parser result summary, readiness, and mode selection.

Useful:

- Drag/drop and file picker.
- File inventory.
- Completeness score and missing recommended files.
- Mode selection.
- Parser summaries for PCB, schematic, BOM, and placement inputs.
- Normalized project readiness and warning visibility.

Problems:

- Page is too long and mixes upload, parser diagnostics, analysis summaries, report readiness, and education.
- The header still says metadata-only Phase 2 even though content parsing exists.
- Multiple warning panels appear before users finish the core upload workflow.
- It only surfaces `Object.values(...)[0]` active parser results, which makes multi-schematic/multi-sheet work unclear.
- Accepted file type education and mode details compete with the primary upload action.
- Parser and analysis detail belongs behind expandable details after the intake decision is made.

Recommendation:

- Redesign as a file workspace with one dominant upload zone, a compact readiness panel, grouped file inventory, mode selector, and next action.
- Move parser summaries into grouped accordions.
- Add explicit multi-schematic/multi-sheet inventory requirements in Phase C.

### `/dashboard`

Current role: project summary across all parsed and derived evidence.

Useful:

- Gives broad system status.
- Shows completeness, parser status, warning counts, report availability, firmware status, and analysis counts.
- Links users toward detailed routes.

Problems:

- Still says content parsing is not implemented.
- Includes planned cards with `Parser not implemented`.
- Mirrors many details from other pages.
- Too many summary panels, making the dashboard difficult to scan.

Recommendation:

- Reduce to 6-8 high-signal tiles: intake completeness, parsed evidence, warning severity counts, report status, firmware readiness, export readiness, and next action.
- Remove planned cards.
- Link out to detail pages instead of repeating their content.

### `/board`

Current role: KiCad PCB layout facts, board metadata, placement summary, net summary, placement findings, layer table, and parser diagnostics.

Useful:

- Strong factual board summary.
- Layout-level warning is appropriate.
- Placement export actions exist.
- Layer and diagnostics data are useful for engineering review.

Problems:

- Header says schematic validation begins in Phase 5, which is stale and development-centric.
- Multiple notice panels appear before facts.
- Placement quality findings and diagnostics are always expanded.

Recommendation:

- Lead with board dimensions, layer count, footprint count, net count, and layout availability.
- Move limitations to one compact disclosure.
- Keep layer table and diagnostics collapsible.
- Keep export actions in a small toolbar.

### `/components`

Current role: PCB footprints, schematic symbols, BOM rows, roles, evidence, placement, rails, findings, and firmware involvement.

Useful:

- Combines component evidence from PCB, schematic, BOM, analysis, power, placement, and firmware.
- Component export exists.
- Data is evidence-based and transparent.

Problems:

- Separate footprint, schematic, and BOM tables force users to reconcile component identity manually.
- PCB footprint table is extremely wide.
- Columns like Phase 8 evidence, placement, power rails, findings, and firmware make the table heavy.

Recommendation:

- Create one unified component list keyed by reference designator.
- Use source badges for PCB, schematic, BOM, placement, power, firmware.
- Put detailed evidence in a row drawer or detail panel.
- Keep raw source tables as advanced details.

### `/nets`

Current role: normalized net inventory, filters, exports, net details, bias evidence, firmware notes, diagnostics, and limitations.

Useful:

- Search and filters are already valuable.
- Export to CSV and JSON exists.
- Expanded net details are helpful.

Problems:

- Page starts with phase-labeled copy.
- Summary cards include Phase 8 and Phase 10 terminology.
- Expanded net details contain many panels for one selected net.
- Limitations appear per selected net and globally.

Recommendation:

- Keep the filterable net table as the primary experience.
- Add compact badges for source, classification, confidence, firmware use, and bias evidence.
- Move details into a right-side panel or accordion.
- Keep limitations collapsed unless warnings exist.

### `/power`

Current role: power rails, regulators, inputs, protection, budget evidence, findings, and exports.

Useful:

- Rails table is valuable.
- Regulator/input/protection candidates are useful.
- Power budget evidence and findings support review.
- Export actions exist.

Problems:

- Header and warnings are phase-heavy.
- Limitations appear before the user sees detected rails.
- Power findings are always expanded.

Recommendation:

- Lead with rails, inputs, regulators, and highest findings.
- Keep one limitations disclosure.
- Keep detailed findings and budget evidence below the primary rail view.

### `/bom`

Current role: BOM parser output and export.

Useful:

- Straightforward route.
- Clear CSV and JSON export.
- Summary tiles show rows, references, and diagnostics.

Problems:

- Table is wide.
- Copy repeats that BOM-to-PCB validation is not implemented.
- Spreadsheet support message is still phase-specific.

Recommendation:

- Keep summary and export toolbar.
- Make the BOM table denser but more readable with priority columns.
- Move unsupported spreadsheet notes into a neutral capability message.

### `/firmware`

Current role: firmware guidance manual from schematic/PCB evidence, including MCU candidates, pin mapping, peripherals, drivers, connector pinouts, checklist, safety notes, and bring-up.

Useful:

- Strong value area for users.
- Filters for MCU/peripheral/confidence exist.
- Pin map table is central and useful.
- Guidance language appropriately avoids overclaiming.

Problems:

- Page is very long.
- Most sections are fully expanded.
- The user has to pass several narrative sections before reaching bring-up and safety details.
- Header is still phase-labeled.

Recommendation:

- Lead with firmware readiness, MCU candidates, and pin map.
- Use tabs or accordions for peripherals, driver suggestions, connectors, checklist, safety, and bring-up.
- Keep guidance limitations in a single persistent banner or disclosure.

### `/reports`

Current role: engineering report view, markdown/JSON/PDF/browser export, CSV exports, executive summary, recommendations, risk matrix, sections, evidence register, and limitations.

Useful:

- Most important final-output route.
- Export coverage is strong.
- Risk matrix, recommendations, evidence register, and limitations are all present.

Problems:

- Report page is very long.
- Risk matrix is dense.
- Section tables show row counts rather than user-friendly previews.
- Export area reads as a card rather than a compact report toolbar.
- Phase 11 terminology remains visible.

Recommendation:

- Make report header, export toolbar, executive summary, top risks, and recommendations the primary view.
- Move full sections, evidence register, and limitations into accordions.
- Keep print/export actions visible but visually quiet.

## 5. Intake/upload redesign requirements

Future intake redesign should include:

- A single dominant upload area at the top.
- A compact right-side or top summary for readiness score, missing files, selected mode, and next action.
- File inventory grouped by type: schematic, PCB, manufacturing, drill, BOM, placement, netlist, archive, unsupported.
- Per-file status: recognized, parsed, unsupported, warning, failed.
- Parser result details behind disclosure controls.
- Neutral capability language instead of phase-history language.
- A compact mode selector for Basic, Analyze, and Firmware.
- Clear call to action after files are selected, such as Review Dashboard or View Report.
- A persistent limitations summary that does not repeat every parser caveat inline.
- No simulated parser results and no fake engineering findings.

## 6. Multi-schematic / multi-sheet UI requirements

The next intake design must be ready for multiple schematic files and multi-sheet projects.

Required UI behavior:

- Show every `.kicad_sch` file as its own row, not only the first parsed schematic result.
- Display sheet/file name, parse status, symbol count, label count, wire count, global label count, and diagnostics count.
- Distinguish root schematic, child sheet, and unknown sheet when the data model can support it.
- Preserve per-file parser diagnostics.
- Avoid implying schematic-to-PCB validation when only per-file schematic parsing has occurred.
- Show a combined schematic evidence summary only when the normalized model explicitly supports aggregation.
- Prepare for future hierarchy visualization without implementing it in Phase A.

Implementation risk:

- Current pages often select the first parser result with `Object.values(...)[0]`. That pattern is simple but insufficient for multi-schematic UX and should be replaced during the intake redesign phase after model behavior is confirmed.

## 7. Simplified information architecture proposal

Recommended navigation grouping:

- Project
  - Intake
  - Dashboard
- Hardware Evidence
  - Board
  - Components
  - Nets
  - Power
  - BOM
- Outputs
  - Firmware
  - Reports

Recommended route behavior:

- Keep all existing routes for compatibility.
- Remove or de-emphasize `/` as a full landing page after the shell redesign.
- Prefer Dashboard as the signed-in/default work surface once files exist.
- Keep Intake as the starting point when no files exist.

## 8. Visual system recommendations

- Keep the dark technical visual direction, but reduce borders, nested panels, and repeated card surfaces.
- Replace phase/status text with capability and confidence language.
- Standardize severity, confidence, source, and status badges.
- Use compact route headers with optional route actions.
- Use cards for high-level metrics only, not every text block.
- Use accordions or detail panels for diagnostics, evidence, assumptions, limitations, and raw source rows.
- Use tables for scannable data, but introduce column priority and detail drawers for wide datasets.
- Make exports consistent: route toolbar for primary export actions; secondary CSV exports in an overflow/detail group.
- Ensure mobile behavior does not depend on very wide grid-template tables.
- Avoid large hero treatment inside operational pages.

## 9. Content removal/simplification list

Remove or rewrite:

- `Phase 1`, `Phase 2`, `Phase 4`, `Phase 5`, `Phase 6`, `Phase 7`, `Phase 8`, `Phase 9`, `Phase 10`, and `Phase 11` labels from user-facing headings where they are not needed.
- `Upload not active`.
- `Parser not implemented` where parsers now exist.
- `Reports not implemented` where report generation exists.
- `Content parsing not implemented yet` on dashboard.
- `Phase 1 shell only` global banner.
- Dashboard planned cards.
- Repeated page-level warnings that say the same validation limitations.
- Long accepted-file education above the primary intake workflow.
- Raw parser/analysis details from the default intake view.

Keep, but simplify:

- Evidence-based caveats.
- Confidence and severity labels.
- Export limitations.
- Unsupported spreadsheet messaging.
- No-fake-data positioning.

## 10. Recommended implementation phases

1. Frontend Phase B - Simplified App Shell and Navigation
   - Update shell status.
   - Group navigation.
   - Remove stale global phase banner.
   - Improve empty-state consistency.
   - Do not redesign the full intake yet.

2. Frontend Phase C - Intake Upload Workspace Redesign
   - Rebuild `/intake` around upload, file inventory, readiness, mode, and next action.
   - Add multi-schematic/multi-sheet-ready presentation.
   - Move parser diagnostics into collapsible details.

3. Frontend Phase D - Results Pages Simplification
   - Simplify Dashboard, Board, Components, Nets, Power, and BOM.
   - Reduce repeated warnings.
   - Add detail drawers/accordions for dense evidence.

4. Frontend Phase E - Reports and Firmware Polish
   - Make Reports and Firmware feel like final output workspaces.
   - Improve export toolbar consistency.
   - Collapse long sections by default.

5. Frontend Phase F - Final MVP Review
   - Full usability pass.
   - Responsive pass.
   - Copy consistency pass.
   - Final validation and route smoke test.

## 11. Risk list

- `useFileIntake` is central to many pages; changes can ripple across the app.
- `normalizedProject` powers most route state and must not be casually reshaped during UI-only phases.
- Multi-schematic UI may require model changes later; Phase A does not implement those changes.
- `globals.css` contains many route-specific table classes and grid definitions; broad edits can affect unrelated routes.
- Existing tests may assert current copy or export behavior.
- Removing warnings too aggressively could make the app overclaim engineering certainty.
- Navigation changes could hide important routes if grouping is not clear.
- Report and firmware pages are high-value routes; simplification must preserve confidence and limitation language.

## 12. Exact next phase scope

Next phase: Frontend Phase B - Simplified App Shell and Navigation.

Allowed in Phase B:

- Update topbar status to reflect current MVP capability.
- Replace the stale global phase banner with a current, concise capability/confidence banner or remove it if redundant.
- Group navigation into Project, Hardware Evidence, and Outputs.
- Simplify `/` enough to stop contradicting current capabilities.
- Improve route empty states for consistency.
- Keep all current routes available.

Not allowed in Phase B:

- Full intake redesign.
- Parser changes.
- Analysis changes.
- Export logic changes.
- Report generation changes.
- Firmware logic changes.
- Simulated findings or fake design data.
