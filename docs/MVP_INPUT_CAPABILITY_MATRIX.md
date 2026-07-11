# GEBER AI MVP Input Capability Matrix

This matrix records the canonical product input scope after the Product Scope Override. It also records legacy parser capabilities that still exist in the repository but are not canonical user inputs for the realigned MVP.

## Canonical MVP input model

```ts
type ProjectInputPackage = {
  schematicFiles: readonly LocalDesignFile[];
  gerberFiles: readonly LocalDesignFile[];
};
```

Only schematic files and Gerber/Gerber-package files are canonical user inputs.

Noncanonical user uploads:

- Uploaded BOM files.
- Pick-and-place files.
- IPC-356 files.
- Native KiCad PCB files.
- Separate required drill-file input.
- EasyEDA exports.
- Optional advanced project evidence.

These file types may still appear in legacy code or older documentation, but the realigned MVP workflow must not require them or present them as public user inputs.

## Summary verdict

The current application can parse KiCad schematic files. It can recognize individual Gerber-like files and extract ZIP Gerber packages locally in the browser, but it does not parse Gerber geometry or X2 attributes yet.

The final MVP must therefore treat Gerber evidence as detected/classified until a real Gerber parser exists. Inspect mode may require Gerber file presence, but it must not claim manufacturing geometry analysis, schematic-to-Gerber validation, or exact placement correlation until later Gerber capability phases implement those facts.

## Canonical format matrix

| Input format | Canonical user input | Recognized today | Parsed today | Current role | Extractable today | Not extractable today | Confidence today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KiCad schematic `.kicad_sch` | Yes | Yes | Yes | Primary logical source for Inspect and Firmware modes | Symbols, properties, pins, labels, wires, sheets, no-connects, title block | Full net solving, full hierarchy aggregation, formal ERC, complete internal BOM generation | Medium |
| Gerber RS-274X | Yes | Yes | No | Required manufacturing evidence presence for Inspect mode | File presence, extension, inferred layer category from filename | Copper geometry, apertures, coordinates, mask, silk, outline, attributes, net names, placement facts | Low |
| Gerber X2 | Yes, when supplied as Gerber evidence | Filename-inferred only | No | Future enhanced Gerber evidence | File presence and filename hint only | X2 attributes, components, net attributes, placement attributes, geometry | Low |
| Gerber ZIP package/container | Yes, when extracted entries are Gerber files | Yes | Extracted/classified only | Ergonomic Gerber package input | ZIP entry discovery, nested directories, Gerber entry classification, ignored-entry diagnostics, package-to-entry source metadata | Geometry, apertures, commands, X2 attributes, Excellon drill content, nested archive extraction | Low |

## Noncanonical legacy capability matrix

These formats are not canonical user inputs after the scope override.

| Format | Current code status | Public MVP input status | Notes |
| --- | --- | --- | --- |
| Native KiCad PCB `.kicad_pcb` | Recognized and parsed | Remove from public input workflow | May remain as legacy/internal code, but Phase C orchestrator must not require it. |
| KiCad project `.kicad_pro` | Recognized, metadata only | Remove from public input workflow | Not part of `ProjectInputPackage`. |
| Uploaded BOM CSV/TSV | Recognized and parsed | Remove from public input workflow | Inspect mode must generate BOM data internally from schematic evidence later. Uploaded BOM must not be required. |
| Uploaded BOM XLS/XLSX | Recognized, unsupported | Remove from public input workflow | Not part of canonical MVP input. |
| Pick-and-place CSV/TSV | Recognized and parsed | Remove from public input workflow | Exact placement correlation is unavailable unless future Gerber attributes support it. |
| Separate Excellon drill file | Recognized, not parsed | Not a separate required input | Drill entries inside ZIP packages are diagnosed as auxiliary and do not satisfy Gerber readiness. |
| IPC-356 | Recognized, not parsed | Remove from public input workflow | Not part of canonical MVP input. |
| EasyEDA JSON/ZIP | Recognized, not parsed | Remove from public input workflow | Not part of canonical MVP input. |
| Generic unknown files | Recognized as unknown | Not allowed as a product input | Show unsupported state if encountered. |

## Parser coverage

| Parser or generator | Current status | Canonical MVP role |
| --- | --- | --- |
| KiCad schematic parser | MVP-capable | Canonical parser for both modes. |
| Gerber parser | Not implemented | Required future capability for geometry, attributes, and physical correlation. |
| Schematic-derived BOM generator | Not implemented | Required future capability for Inspect output. Missing fields must remain unknown. |
| Native KiCad PCB parser | Implemented legacy capability | Not canonical user input. Do not depend on it in Phase C orchestration. |
| Uploaded BOM parser | Implemented legacy capability for CSV/TSV | Not canonical user input. |
| Placement parser | Implemented legacy capability for CSV/TSV | Not canonical user input. |
| Drill parser | Not implemented | Do not require separate drill input in the canonical workflow. |
| IPC-356 parser | Not implemented | Not canonical user input. |
| Gerber ZIP package intake | Implemented for local extraction/classification | Canonical only for extracted Gerber entries; raw ZIP parents are not Gerber evidence. |
| EasyEDA parser | Not implemented | Not canonical user input. |

## Mode requirements

### Inspect / Analysis mode

Required canonical inputs:

- One or more schematic files.
- One or more Gerber or Gerber-package files.

Package rule:

- A ZIP package satisfies Gerber readiness only when at least one contained entry is extracted and classified as Gerber evidence.
- A drill-only, document-only, nested-archive-only, or noncanonical package does not satisfy readiness.

Output selection:

- Deterministic engineering report.

Required output behavior:

- Include a BOM generated internally from schematic symbols and properties when the generator exists.
- Keep unknown BOM fields unknown.
- Do not depend on uploaded BOM files.
- Do not claim Gerber geometry analysis until the Gerber parser exists.
- Report exact placement correlation as unavailable unless Gerber attributes support it.

### Firmware mode

Required canonical inputs:

- One or more schematic files.

Gerber use:

- Gerber evidence may be used only where physical attributes are actually available.
- With current code, Gerber files provide detection/classification only.

Output selection:

- Master firmware-development document.

Required output behavior:

- Use schematic evidence as the primary logical source.
- Do not depend on uploaded BOM, PCB source, placement, IPC, EasyEDA, or other files.
- Mark incomplete or uncertain mappings explicitly.

## Gerber capability answer

There is no real Gerber geometry parser in the current project. The code recognizes Gerber-like filenames and extensions, groups them in intake UI, and reports file presence. It does not parse:

- Apertures.
- Coordinates.
- Copper primitives.
- Layer polarity.
- Board outline.
- Solder mask.
- Silkscreen.
- X2 attributes.
- Net names.
- Component attributes.
- Reference designators.
- Placement attributes.

ZIP package extraction is implemented, but it only discovers and classifies entries locally in the browser. It does not inspect Gerber commands or manufacturing geometry.

## Correlation capability answer

| Evidence combination | Correlation possible today |
| --- | --- |
| Schematic only | Internal schematic facts and name-based classifications only. |
| Gerber only | No engineering correlation. |
| Schematic plus ordinary Gerber | No content correlation; only file presence can be reported. |
| Schematic plus Gerber X2 | No content correlation; X2 is not parsed. |
| Schematic plus future Gerber attributes | Future physical correlation only after parser support exists. |

Legacy native PCB, uploaded BOM, and placement correlation may exist in older code paths, but they are not canonical MVP user-input dependencies after the scope override.
