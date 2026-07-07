# GEBER AI Demo/MVP Readiness Checklist

This is a demo/MVP readiness checklist. It is not a production certification.

## Build Status

- Run `npm.cmd run build`.
- Confirm Vite production build completes.
- Confirm no unsupported validation claims appear in user-facing copy.

## Test Status

- Run `npm.cmd run test`.
- Current tests cover deterministic intake classification, parser fixtures, BOM/placement parsing, net classification, report generation, and CSV escaping.
- Future hardening should add broader fixtures and UI regression coverage.

## Lint Status

- Run `npm.cmd run lint`.
- ESLint is configured for TypeScript and React hooks with pragmatic project-specific rules.

## Parser Limitations

- Parser coverage is MVP-level.
- KiCad parsing is partial and browser-side.
- Spreadsheet `.xlsx` BOM parsing is recognized but not implemented.
- Gerber, drill, IPC-356, and EasyEDA content parsers are not fully implemented.

## Export Limitations

- Exports are client-side only.
- Browser print/save-as-PDF is not server-side PDF generation.
- Excel `.xlsx` export is not implemented.
- Unknown values are preserved as unknown or blank fields.

## Security Considerations

- No authentication is implemented.
- No backend API is implemented.
- No database is implemented.
- No cloud upload is implemented.
- Browser file handling should be reviewed before public deployment.

## Privacy Model

- Processing is client-side in the browser session.
- Files are not intentionally uploaded to a server by this app.
- No backend storage exists in the current architecture.

## Known Risks

- Large files may affect browser responsiveness.
- Parser support is incomplete.
- Analysis findings are heuristic and evidence-based.
- Datasheet-specific validation is not implemented.
- Manufacturing DFM review is not implemented.
- Electrical validation is not complete.

## Pre-Deployment Checklist

- Confirm build, lint, test, and audit pass.
- Review all user-facing accuracy language.
- Test with synthetic and non-proprietary sample projects.
- Review browser memory behavior with larger files.
- Confirm export outputs preserve unknown values.

## Future Hardening Tasks

- Add more parser fixtures.
- Add UI interaction tests.
- Add accessibility review.
- Add broader report export validation.
- Add manual QA checklist for demo scenarios.
- Add production export workflows only when explicitly authorized.
