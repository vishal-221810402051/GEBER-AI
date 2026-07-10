# GEBER AI Smart Review Workspace

Architecture Phase G adds `/review` as a primary smart review workspace.

## Implemented Model

The workspace follows the hybrid architecture selected in Architecture Phase F:

- `/review` is the high-level review surface.
- Existing detailed evidence routes remain available.
- `/dashboard` remains available and links to the review workspace.
- The deterministic engineering report remains the source of truth.
- AI Review is reused as a consent-gated interpretation panel.

## Route

```txt
/review
```

The route shows a clean empty state when no files are loaded and points users to `/intake`.

## Workspace Sections

- Overview
- Files
- Evidence
- Risks
- Firmware
- AI Review
- Limitations

These sections are client-side tabs and do not introduce nested routes.

## Data Sources

The workspace is built from existing deterministic state:

- uploaded/classified files.
- parser stage status.
- normalized project evidence.
- deterministic report risks and recommendations.
- firmware manual summary.
- missing-data warnings and report limitations.

No raw design files are sent to AI from this workspace.

## Preserved Routes

The following routes remain detailed evidence/output pages:

- `/board`
- `/components`
- `/nets`
- `/power`
- `/bom`
- `/firmware`
- `/reports`

## Explicit Non-Goals

Architecture Phase G does not add chat, streaming, persistence, authentication, backend upload, database storage, parser changes, analysis changes, firmware logic changes, report-generation changes, export changes, or fake AI output.
