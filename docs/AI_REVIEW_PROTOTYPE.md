# GEBER AI AI Review Prototype

Architecture Phase E adds a server-side AI Review prototype. The AI review is an evidence-bound interpretation layer over deterministic GEBER AI outputs.

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
