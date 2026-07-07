# GEBER AI Architecture Phase F - Smart Review Workspace Investigation

## 1. Executive recommendation

Recommendation: choose Option C - Hybrid Smart Review Workspace.

GEBER AI should keep the existing deterministic evidence routes as advanced drill-down pages, while adding a future smart review workspace as the primary review surface. The workspace should summarize evidence, risks, recommendations, missing data, firmware readiness, and AI interpretation in one guided experience without replacing the deterministic report as the source of truth.

Architecture Phase F does not implement the workspace. It locks the UX direction for Architecture Phase G.

## 2. Current route model

Current primary routes:

- `/intake`: upload-first project package intake and readiness.
- `/dashboard`: broad project status and route links.
- `/board`: PCB layout evidence.
- `/components`: component evidence across PCB, schematic, BOM, placement, power, and firmware.
- `/nets`: normalized net inventory and classification.
- `/power`: rails, power candidates, and power findings.
- `/bom`: BOM evidence and exports.
- `/firmware`: firmware guidance manual.
- `/reports`: deterministic engineering report, exports, and AI Review.

Strengths:

- Evidence is traceable and route-specific.
- Deterministic report generation is already centralized.
- Advanced users can inspect raw normalized evidence and exports.
- AI Review is already consent-gated and evidence-bound.

Weaknesses:

- Users must move across many pages to understand what matters most.
- The dashboard and report overlap in purpose.
- Risks, recommendations, missing data, and AI interpretation are separated from route-level evidence.
- The app can feel like a set of technical tables instead of a guided engineering review.

## 3. Option A - Keep Current Routes

Description:

Keep the current route structure and continue polishing individual pages.

Pros:

- Lowest implementation risk.
- Preserves all existing navigation and tests.
- Keeps technical evidence close to its source page.
- Avoids reshaping `normalizedProject`.

Cons:

- Does not solve cross-page review friction.
- AI Review remains attached to reports only.
- Users still need to synthesize risks, evidence, missing data, and next actions manually.
- The app may remain table-heavy even after UI simplification.

Best use:

Option A is suitable for incremental cleanup, but not enough for the next major product step.

## 4. Option B - New Smart Review Workspace Only

Description:

Build a new `/review` route and make it the primary product surface, hiding or removing most existing routes.

Pros:

- Strongest guided user experience.
- Creates a clear home for risks, evidence, next actions, and AI Review.
- Reduces visible navigation complexity.

Cons:

- Higher risk of burying advanced evidence.
- Could duplicate report, dashboard, firmware, and evidence-table logic.
- Removing routes now would be disruptive and unnecessary.
- Over-compression could make confidence and limitations less transparent.

Best use:

Option B is too aggressive for the next phase because GEBER AI still needs advanced evidence inspection.

## 5. Option C - Hybrid Smart Review Workspace

Description:

Add `/review` as the guided primary review workspace while preserving existing evidence routes as advanced/detail pages.

Pros:

- Gives users one place to answer the central review questions.
- Keeps deterministic route-level evidence available.
- Reuses existing report, firmware, risk, recommendation, evidence, and export logic.
- Lets AI Review sit beside deterministic findings without becoming the source of truth.
- Supports incremental implementation in Architecture Phase G.

Cons:

- Requires careful information architecture to avoid duplicating every page.
- Needs strong evidence links to detail pages.
- Needs disciplined component boundaries to avoid another card wall.

Decision:

Option C is the recommended Architecture Phase G direction.

## 6. Recommended Future Route Structure

Primary routes:

- `/intake`: project package intake and readiness.
- `/review`: smart review workspace and default post-intake review surface.
- `/firmware`: firmware guidance output.
- `/reports`: deterministic report and export surface.

Advanced evidence routes:

- `/board`
- `/components`
- `/nets`
- `/power`
- `/bom`

Compatibility:

- Keep all existing routes available.
- Avoid redirects until route-level behavior is tested.
- Dashboard can later become a compact overview or redirect candidate, but Phase G should not remove it.

## 7. Recommended Navigation

Project:

- Intake
- Review

Outputs:

- Firmware
- Reports

Advanced Evidence:

- Board
- Components
- Nets
- Power
- BOM

The navigation should make Review feel like the central workspace without hiding the deterministic detail pages.

## 8. Required Phase G Components

Recommended new components:

- `ReviewWorkspacePage`: route-level page for `/review`.
- `ReviewWorkspace`: composition container for the review experience.
- `ReviewOverview`: compact project readiness, evidence coverage, and confidence summary.
- `ReviewRiskPanel`: prioritized risks with severity, confidence, and evidence IDs.
- `ReviewRecommendationsPanel`: next actions grouped by priority.
- `ReviewEvidencePanel`: selected evidence summary with links to advanced pages.
- `ReviewMissingDataPanel`: missing inputs and warnings.
- `ReviewAiPanel`: reuse or wrap the Phase F `AiReviewPanel`.
- `ReviewLimitationsPanel`: concise limitations and confidence caveats.
- `ReviewExportToolbar`: links to deterministic report and existing exports.

Reuse existing components where practical:

- `GlassAlert`
- `GlassStatusCard`
- `LoadingDots`
- `ProcessingOverlay`
- `RadialProgress`
- intake readiness and grouped file display concepts
- report risk/recommendation data structures
- export helpers

## 9. Data Dependencies

Phase G should derive the workspace from existing deterministic state:

- `useFileIntake`
- `normalizedProject`
- parser diagnostics and missing recommended files
- deterministic analysis issues
- report risk matrix
- report recommendations
- report evidence register
- firmware guidance summary
- export readiness state

Do not reshape `normalizedProject` during the first workspace implementation unless a typed compatibility layer is added.

## 10. AI Review Placement

AI Review should appear inside the future workspace as an interpretation panel or tab, not as a replacement for deterministic review.

Required behavior:

- User consent is required before any AI call.
- Backend status is visible.
- AI configuration state is visible.
- Report availability is visible.
- Structured evidence package summary is visible.
- Raw design files are not sent.
- AI Review results must cite evidence IDs where available.
- Missing evidence must be shown as missing, not inferred.
- No chat, streaming, polling, or persistence in Phase G unless separately approved.

## 11. Evidence IDs and Traceability

The workspace should show evidence IDs directly on risks and recommendations when available. Each risk or action should make it clear whether support comes from direct parsed evidence, deterministic inference, missing-data warnings, or AI interpretation.

Recommended display:

- severity badge
- confidence badge
- evidence ID chips
- source badge
- link to advanced route when available

## 12. Risk and Recommendation Priority

The workspace should prioritize by:

1. High severity risks.
2. Missing data that blocks confidence.
3. High-priority recommendations.
4. Firmware safety and bring-up blockers.
5. Export/report readiness.

Priority must be deterministic. AI Review may explain the priority but must not silently reorder the source of truth.

## 13. Loading, Progress, and Alerts

Use the Architecture Phase B and C UI system:

- `GlassAlert` for capability, limitation, backend, and missing-data states.
- `GlassStatusCard` for readiness and capability summaries.
- `LoadingDots` for short inline async states.
- `ProcessingOverlay` for active AI review.
- `RadialProgress` only for deterministic readiness/confidence percentages.

Do not fake parser progress, AI progress, or review stages.

## 14. Avoiding Card Walls

The workspace should not repeat every route table. It should lead with:

- one readiness summary
- top risks
- top recommendations
- missing data
- evidence coverage
- AI interpretation

Detailed evidence belongs in collapsible sections or existing advanced routes.

## 15. Source of Truth Rule

The deterministic report remains the source of truth.

AI Review may:

- summarize deterministic evidence.
- explain implications.
- identify questions based on provided evidence.
- suggest next review steps.

AI Review must not:

- claim validation.
- invent measurements.
- invent components or nets.
- treat missing files as present.
- replace deterministic severity or confidence.

## 16. Recommended Phase G Scope

Architecture Phase G should implement:

- `/review` route.
- navigation entry for Review.
- smart review workspace composed from existing deterministic report state.
- AI Review placement inside the workspace using Phase F components.
- links from workspace items to advanced evidence pages where practical.
- tests for workspace summary derivation.

Architecture Phase G should not implement:

- chat.
- streaming.
- backend persistence.
- user accounts.
- raw file upload to backend.
- parser changes.
- analysis engine changes.
- report-generation changes.
- normalized model reshape.
