# GEBER AI MVP Input Capability Matrix

This matrix records actual support observed in the current codebase. It does not infer capability from phase names.

## Summary verdict

The current application is strongest when users provide KiCad schematic and native KiCad PCB source files. Gerber, drill, IPC-356, ZIP, and EasyEDA files are recognized but not parsed for engineering content.

## Format matrix

| Input format | Recognized | Parsed | Metadata-only | Unsupported content | Inspect required | Firmware required | Optional advanced evidence | Extractable today | Not extractable today | Cross-comparison today | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `.kicad_sch` | Yes | Yes | No | No | Strongly recommended | Required for useful output | No | Symbols, properties, pins, labels, wires, sheets, no-connects, title block | Full net solving, full hierarchy aggregation, formal ERC | Can be compared informally with native PCB net/pad evidence | Medium |
| `.kicad_pcb` | Yes | Yes | No | No | Optional but strongest physical evidence | Optional | Yes | Layers, nets, footprints, pads, tracks, vias, zones, outline primitives, bounding box | DRC, DFM, stackup validation, impedance, thermal analysis | Can correlate some references, pads, and net names with schematic/BOM/placement | Medium-high |
| `.kicad_pro` | Yes | No | Yes | Project content | Optional | Optional | Yes | Filename and file metadata | Project structure, sheet list, board relationship | None | Low |
| Gerber RS-274X | Yes | No | Yes | Geometry and attributes | Intended required manufacturing evidence, but not content-parsed yet | Optional | Yes | File presence, extension, inferred layer category | Copper, mask, silk, outline, coordinates, apertures, attributes, net names | None | Low |
| Gerber X2 | Filename-inferred only | No | Yes | X2 attributes and geometry | Intended required manufacturing evidence, but not content-parsed yet | Optional | Yes | File presence and filename hint | X2 attributes, components, net attributes, geometry | None | Low |
| Excellon drill | Yes | No | Yes | Drill geometry | Intended for Inspect manufacturing evidence | Optional | Yes | File presence | Drill hits, sizes, plated status, slot geometry | None | Low |
| IPC-356 | Yes | No | Yes | Netlist content | Optional | Optional | Yes | File presence | Nets, test points, pin/net correlation | None | Low |
| BOM CSV/TSV | Yes | Yes | No | No for delimited text | Optional | Optional | Yes | References, quantities, values, footprints, MPNs, suppliers, ratings, notes | Datasheet validation, purchasing validation | Reference-level evidence with PCB/schematic/placement when names align | Medium |
| BOM XLS/XLSX | Yes | No | Yes | Spreadsheet rows | Optional | Optional | Yes | Unsupported diagnostic | Workbook sheets and rows | None | Low |
| Pick-and-place CSV/TSV | Yes | Yes | No | No for delimited text | Optional | Optional | Yes | References, x/y, side, rotation, footprint, value | Package body geometry, machine setup validation | Reference-level placement evidence with PCB footprints | Medium |
| ZIP archive | Yes | No | Yes | Archive contents | Ergonomic target for Gerber packages | Optional | Yes | Archive file presence | Contained files and nested classification | None | Low |
| EasyEDA JSON/ZIP | Yes | No | Yes | Export contents | Optional future source | Optional future source | Yes | File presence | Schematic, PCB, BOM, project contents | None | Low |
| Unknown file | Yes as unknown | No | Yes | All content | No | No | No | Filename and size | Engineering content | None | Very low |

## Current parser coverage

| Parser | Current status | Notes |
| --- | --- | --- |
| KiCad schematic parser | MVP-capable | Extracts useful facts but does not solve full connectivity. |
| KiCad PCB parser | MVP-capable | Extracts native board facts and geometry primitives. |
| BOM parser | MVP-capable for CSV/TSV | Spreadsheet formats are recognized but not parsed. |
| Placement parser | MVP-capable for CSV/TSV | Unit and column variation are handled heuristically. |
| Gerber parser | Not implemented | No geometry extraction exists. |
| Drill parser | Not implemented | No Excellon geometry extraction exists. |
| IPC-356 parser | Not implemented | No netlist extraction exists. |
| Archive parser | Not implemented | ZIP contents are not inspected. |
| EasyEDA parser | Not implemented | EasyEDA exports are classified only. |

## Mode requirements

### Inspect / Analysis mode

Recommended evidence:

- Required for useful report: at least schematic plus manufacturing package metadata.
- Strongly recommended: native KiCad PCB until Gerber parsing exists.
- Optional advanced: BOM, pick-and-place, IPC-356, drill.

Current practical reality:

- A report can be generated from any uploaded files, but true manufacturing analysis requires parser capability that does not yet exist for Gerber/drill files.
- Inspect mode should use evidence tiers and clearly separate facts, inferences, missing data, and limitations.

### Firmware mode

Recommended evidence:

- Required for useful output: schematic.
- Strongly recommended: native KiCad PCB for pad/net/pin correlation.
- Optional advanced: BOM and placement.

Current practical reality:

- Firmware mode can produce useful guidance from schematic and native PCB evidence.
- It must mark incomplete or uncertain mappings when PCB, datasheet, or full schematic connectivity evidence is missing.

## Gerber capability answer

There is no real Gerber geometry parser in the current project. The code recognizes Gerber-like filenames and extensions, groups them in the intake UI, and includes missing-data warnings, but it does not parse:

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

## Correlation capability answer

| Evidence combination | Correlation possible today |
| --- | --- |
| Schematic only | Internal schematic facts and name-based classifications only. |
| Gerber only | No engineering correlation. |
| Schematic plus ordinary Gerber | No content correlation; only file presence can be reported. |
| Schematic plus Gerber X2 | No content correlation; X2 is not parsed. |
| Schematic plus Gerber plus IPC-356 | No content correlation; IPC-356 is not parsed. |
| Schematic plus native KiCad PCB | Informational correlation by reference, pin number, pad net, and net names where evidence aligns. |
| Schematic plus native KiCad PCB plus BOM plus placement | Best current tier; component, net, placement, power, and firmware evidence can be combined, but findings remain heuristic. |
