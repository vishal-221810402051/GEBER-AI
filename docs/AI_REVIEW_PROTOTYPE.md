# GEBER AI AI Review Prototype

Architecture Phase E adds a server-side AI Review prototype. Architecture Phase F polishes the Reports page AI Review UX and keeps the review as an evidence-bound interpretation layer over deterministic GEBER AI outputs.

## Purpose

The AI review helps explain risks, questions, next actions, confidence notes, and report narrative from structured deterministic evidence. It does not replace parsers, analysis, firmware guidance, risk matrix generation, reports, datasheet review, DFM review, electrical validation, or engineering judgement.

## Data Sent

Only structured evidence is sent to the backend AI endpoint:

- Project name and generated timestamp.
- File counts and categories.
- Parser stage status summaries.
- Evidence IDs, titles, confidence, and short details.
- Risk IDs, severity, titles, descriptions, recommendations, and evidence IDs.
- Missing-data warning summaries.
- Firmware and report summaries.

## Data Not Sent

The Phase E AI review does not send:

- Raw KiCad files.
- Raw Gerber files.
- Raw BOM file contents.
- Uploaded files.
- Full parser tables.
- API keys to frontend code.

## Consent Behavior

The Reports page requires explicit user consent before calling `POST /api/ai-review`. The AI review never runs automatically.

## Phase F UX States

The Reports page AI Review panel now separates these states:

- deterministic report unavailable.
- backend status checking.
- backend unavailable.
- backend online.
- AI Review not configured.
- explicit consent required.
- AI Review running.
- AI Review success.
- AI Review error.

The panel checks backend capabilities gracefully, supports manual re-checking, and does not poll.

## Evidence Transparency

The AI Review panel includes a compact structured evidence package summary before consent. It shows counts for files, parser status, evidence items, risks, recommendations, missing-data warnings, firmware summary, and report confidence without displaying huge JSON or raw uploaded design content.

## Result Presentation

AI Review results are presented as interpretation, not validation. The result view separates:

- engineering readiness.
- top risks.
- next actions.
- questions.
- confidence notes.
- report narrative.
- limitations.

Evidence IDs are shown when provided. Missing evidence IDs are flagged for review instead of being treated as proof.

## Backend API Key Handling

`OPENAI_API_KEY` is read only by the Node backend. The frontend never receives this key and never imports the OpenAI SDK.

Required only when enabling AI review:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
AI_REVIEW_MAX_INPUT_BYTES=120000
AI_REVIEW_RATE_LIMIT_PER_MINUTE=10
```

The backend starts without `OPENAI_API_KEY`. In that case, `/api/ai-review` returns `AI_REVIEW_NOT_CONFIGURED`.

## Endpoint

`POST /api/ai-review`

Request:

```json
{
  "consent": true,
  "input": {
    "project": {
      "generatedAt": "ISO timestamp"
    },
    "fileSummary": {
      "totalFiles": 0,
      "recognizedFiles": 0,
      "unsupportedFiles": 0,
      "categories": [],
      "missingRecommendedFiles": []
    },
    "parserStatus": [],
    "evidenceSummary": [],
    "risks": [],
    "recommendations": [],
    "missingDataWarnings": []
  }
}
```

Success returns a structured AI review result. Failure returns a typed error such as:

- `AI_REVIEW_CONSENT_REQUIRED`
- `AI_REVIEW_INVALID_INPUT`
- `AI_REVIEW_INPUT_TOO_LARGE`
- `AI_REVIEW_RATE_LIMITED`
- `AI_REVIEW_NOT_CONFIGURED`
- `AI_REVIEW_PROVIDER_ERROR`

## Safety Rules

- AI must use only provided JSON evidence.
- AI must not invent components, nets, files, datasheet facts, measurements, or validation results.
- AI must cite evidence IDs where relevant.
- AI must say when data is missing.
- AI must never claim the board is safe, validated, manufacturable, compliant, or production-ready.

## Running Locally

Frontend:

```powershell
npm.cmd run dev
```

Backend:

```powershell
npm.cmd run server:dev
```

Build checks:

```powershell
npm.cmd run build
npm.cmd run server:build
```

## Testing Configured vs Unconfigured

Without `OPENAI_API_KEY`, the AI endpoint should return `AI_REVIEW_NOT_CONFIGURED`.

With `OPENAI_API_KEY` configured in local `.env`, the backend can call OpenAI from the server only. Do not commit `.env`.

## Future Chat Mode

Chat mode is deferred. A future phase may add evidence-linked questions after this prototype is stable and the safety model is reviewed.

## Smart Review Workspace Direction

Architecture Phase F recommends a future hybrid smart review workspace: a new guided review surface that reuses deterministic report evidence and keeps current Board, Components, Nets, Power, and BOM pages as advanced evidence routes. AI Review should be placed inside that workspace as a consent-gated interpretation panel, while the deterministic report remains the source of truth.
