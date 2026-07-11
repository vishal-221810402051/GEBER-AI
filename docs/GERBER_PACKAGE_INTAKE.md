# GEBER AI Gerber Package Intake

Product Realignment Phase D1 adds browser-side ZIP package intake for Gerber files.

## Scope

Supported canonical inputs remain:

- KiCad schematic files.
- Individual Gerber files.
- ZIP packages containing Gerber files.

The ZIP package itself is not Gerber evidence. Only entries extracted from the package and classified as Gerber files enter `ProjectInputPackage.gerberFiles`.

## Dependency

Phase D1 uses `fflate`.

Reason:

- Browser-compatible.
- Works with byte arrays.
- Does not require Node filesystem APIs.
- Supports deterministic ZIP generation and extraction in tests.
- Keeps package intake local to the frontend.

## Safety Limits

```ts
GERBER_PACKAGE_LIMITS = {
  maxCompressedBytes: 50 * 1024 * 1024,
  maxExtractedBytes: 150 * 1024 * 1024,
  maxEntries: 500,
  maxSingleEntryBytes: 50 * 1024 * 1024,
};
```

## Entry Rules

Canonical Gerber entries:

- Classified as existing Gerber or Gerber X2 candidate file types.
- Added as virtual browser `File` records.
- Preserve source package ID, package name, and relative path.
- Are parsed by the Phase D2 RS-274X geometry parser when the entry syntax is supported.

Auxiliary entries:

- Drill files, fabrication notes, README/job metadata.
- Retained in package diagnostics only.
- Do not satisfy readiness.

Ignored or unsupported entries:

- BOM.
- Pick-and-place.
- Native PCB source.
- IPC-356.
- EasyEDA.
- PDFs/images/unknown files.
- Nested ZIP archives.
- Directories.

These entries are not parsed and are not added to canonical workflow state.

## Safety Behavior

The intake rejects or diagnoses:

- Invalid or corrupt ZIP packages.
- Empty ZIP packages.
- Packages with no Gerber entries.
- Excessive entry count.
- Excessive extracted size.
- Oversized single entries.
- Encrypted entries.
- Unsupported compression methods.
- Unsafe absolute, drive-letter, null-character, or path-traversal entry paths.
- Duplicate entry paths.
- Nested archives.

Extraction is memory-only. Entries are never written to disk, uploaded to the backend, persisted, or sent to OpenAI.

## Phase D2 Parser Handoff

After Phase D2, extracted Gerber entries enter the same parser result map as direct Gerber uploads. The ZIP parent remains an extraction record only and is never parsed as Gerber source.

The package summary remains package-level intake information. Per-entry geometry parser status is shown in the file inventory.

## Explicit Non-Claims

Package intake and D2 parsing still do not implement:

- Gerber X2 semantic extraction.
- Excellon drill parsing.
- Schematic-to-Gerber correlation.
- Manufacturing validation.

Next phase: Product Realignment Phase D3 - Excellon Drill and Gerber X2 Parser.
