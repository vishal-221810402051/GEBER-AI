# GEBER AI Backend Foundation

Architecture Phase D adds a lightweight Node.js and TypeScript backend-for-frontend foundation.

## Purpose

The backend exists to prepare for future secure server-side workflows, especially AI review and API key handling. The deterministic PCB parsing, analysis, firmware guidance, reports, and exports remain in the browser.

## Implemented

- Fastify server boot.
- `GET /health`.
- `GET /api/capabilities`.
- Local CORS for the configured frontend origin.
- Request body size limit.
- Shared backend response types.
- Consistent JSON error shape for missing routes and request/server errors.
- Environment loading from `.env` when present.
- `.env.example` with placeholders only.
- Frontend API client foundation that fails normally if the backend is not running.

## Not Implemented

- OpenAI calls.
- AI review.
- API keys in frontend code.
- File upload.
- Persistence or database storage.
- Authentication.
- Cloud upload.
- Server-side parsing, analysis, firmware logic, reports, or exports.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Run the frontend:

```powershell
npm.cmd run dev
```

Run the backend:

```powershell
npm.cmd run server:dev
```

Default backend URL:

```txt
http://localhost:8787
```

## Environment

Copy `.env.example` to `.env` only for local development.

```env
PORT=8787
CORS_ORIGIN=http://localhost:5173
```

`OPENAI_API_KEY` is listed only as a future placeholder and is not required or used in Architecture Phase D.

## Secret Rules

- Do not commit `.env`.
- Do not put secrets in Vite frontend variables.
- Do not expose `OPENAI_API_KEY` to browser code.
- Future AI work must use server-side environment variables only.

## Endpoints

### `GET /health`

Returns backend health:

```json
{
  "ok": true,
  "service": "geber-ai-backend",
  "status": "healthy",
  "timestamp": "ISO timestamp"
}
```

### `GET /api/capabilities`

Returns honest current backend capability flags. AI review, upload, persistence, and authentication are `false` in Phase D.

## Future AI Integration

Architecture Phase E may add an AI review prototype if explicitly approved. That work should send structured deterministic evidence only after user consent and must keep API keys server-side. Phase D intentionally defers OpenAI SDK installation and all AI endpoints.
