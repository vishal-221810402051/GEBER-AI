import type { ParserStage } from "../../domain";
import type { ClassifiedFile } from "../../features/intake/intakeTypes";
import type { IntakeDisplayGroup } from "../../features/intake/intakeDisplayTypes";

type ParserStatusAccordionProps = Readonly<{
  stages: readonly ParserStage[];
  files: readonly ClassifiedFile[];
  groups: readonly IntakeDisplayGroup[];
}>;

function groupForStage(stage: ParserStage, groups: readonly IntakeDisplayGroup[]) {
  if (stage.id.includes("schematic")) {
    return groups.find((group) => group.id === "schematics");
  }

  if (stage.id.includes("pcb")) {
    return groups.find((group) => group.id === "pcb-layouts");
  }

  if (stage.id.includes("bom")) {
    return groups.find((group) => group.id === "bom");
  }

  if (stage.id.includes("place")) {
    return groups.find((group) => group.id === "placement");
  }

  return undefined;
}

export function ParserStatusAccordion({ stages, files, groups }: ParserStatusAccordionProps) {
  return (
    <section className="intake-module">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Parser status</span>
          <h2>Compact parser overview</h2>
        </div>
      </div>
      <div className="parser-accordion-grid">
        {stages
          .filter((stage) =>
            [
              "file-classification",
              "kicad-pcb-parser",
              "kicad-schematic-parser",
              "bom-parser",
              "pick-and-place-parser",
              "gerber-parser",
              "excellon-drill-parser",
              "ipc-356-parser",
              "easyeda-parser"
            ].includes(stage.id)
          )
          .map((stage) => {
            const relatedGroup = groupForStage(stage, groups);
            const relatedFiles = stage.fileIds
              .map((id) => files.find((file) => file.id === id)?.name)
              .filter(Boolean);
            const diagnosticCount = relatedGroup?.files.reduce(
              (count, file) => count + file.diagnostics.length,
              0
            ) ?? 0;

            return (
              <details key={stage.id} className="parser-status-card">
                <summary>
                  <span>{stage.label}</span>
                  <span className="status-pill">{stage.status}</span>
                </summary>
                <div className="intake-micro-grid">
                  <span>Files <strong>{stage.fileIds.length}</strong></span>
                  <span>Parsed <strong>{relatedGroup?.parsedCount ?? 0}</strong></span>
                  <span>Failed <strong>{relatedGroup?.failedCount ?? 0}</strong></span>
                  <span>Diagnostics <strong>{diagnosticCount}</strong></span>
                </div>
                <p className="muted">{stage.message}</p>
                {relatedFiles.length ? (
                  <p className="muted">Files involved: {relatedFiles.join(", ")}</p>
                ) : null}
              </details>
            );
          })}
      </div>
    </section>
  );
}
