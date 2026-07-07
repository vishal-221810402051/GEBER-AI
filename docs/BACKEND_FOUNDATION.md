# GEBER AI Backend Foundation

Architecture Phase D added a lightweight Node.js and TypeScript backend-for-frontend foundation. Architecture Phase E extends it with a consent-gated AI review endpoint.

## Purpose

The backend exists to prepare for future secure server-side workflows, especially AI review and API key handling. The deterministic PCB parsing, analysis, firmware guidance, reports, and exports remain in the browser.

## Implemented

- Fastify server boot.
- `GET /health`.
- `GET /api/capabilities`.
- `POST /api/ai-review` for structured evidence only when configured.
- Local CORS for the configured frontend origin.
- Request body size limit.
- Shared backend response types.
- Consistent JSON error shape for missing routes and request/server errors.
- Environment loading from `.env` when present.
- `.env.example` with placeholders only.
- Frontend API client foundation that fails normally if the backend is not running.

## Not Implemented

- Raw design file upload to AI.
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

`OPENAI_API_KEY` is optional and used only by the backend AI review endpoint when explicitly configured.

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

Returns honest current backend capability flags. AI review is available as a configured server-side endpoint, `aiReviewConfigured` reports whether `OPENAI_API_KEY` is set, and upload, persistence, and authentication remain `false`.

### `POST /api/ai-review`

Accepts consent-gated structured deterministic evidence only. It does not accept file uploads and does not store request data.

## Future AI Integration

Future phases may polish AI review UX or add chat if explicitly approved. Chat must remain evidence-bound and keep API keys server-side.
