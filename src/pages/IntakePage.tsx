import { useMemo, useRef, useState } from "react";
import { FileInventoryGroup } from "../components/intake/FileInventoryGroup";
import { IntakeModeSelector } from "../components/intake/IntakeModeSelector";
import { IntakeNextActions } from "../components/intake/IntakeNextActions";
import { IntakeReadinessPanel } from "../components/intake/IntakeReadinessPanel";
import { ParserStatusAccordion } from "../components/intake/ParserStatusAccordion";
import { UploadDropzone } from "../components/intake/UploadDropzone";
import { groupFilesForDisplay } from "../features/intake/groupFilesForDisplay";
import { useFileIntake } from "../features/intake/useFileIntake";
import { PageHeader } from "./shared/PageHeader";

const severityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4
};

export function IntakePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    addFiles,
    clearFiles,
    completeness,
    files,
    bomResults,
    kicadPcbResults,
    kicadSchematicResults,
    mode,
    normalizedProject,
    removeFile,
    setMode,
    totalSizeBytes,
    placementResults
  } = useFileIntake();

  const displayGroups = useMemo(
    () =>
      groupFilesForDisplay(files, {
        bomResults,
        kicadPcbResults,
        kicadSchematicResults,
        placementResults
      }),
    [bomResults, files, kicadPcbResults, kicadSchematicResults, placementResults]
  );

  const hasSchematic = completeness.categories.some(
    (category) => category.key === "kicad-schematic" && category.present
  );
  const hasPcb = completeness.categories.some(
    (category) => category.key === "kicad-pcb" && category.present
  );
  const parsedFiles = displayGroups.reduce((count, group) => count + group.parsedCount, 0);
  const parserWarningCount = displayGroups.reduce((count, group) => count + group.warningCount, 0);
  const totalWarningCount = parserWarningCount + normalizedProject.missingDataWarnings.length;
  const hasPcbData = Object.values(kicadPcbResults).some((result) => result.success);
  const hasSchematicData = Object.values(kicadSchematicResults).some((result) => result.success);
  const hasFirmwareData = Boolean(normalizedProject.firmware.manual?.available);
  const hasReport = Boolean(normalizedProject.report.engineeringReport?.available);
  const showFirmwareWarning = mode === "firmware" && (!hasSchematic || !hasPcb);
  const sortedWarnings = [...normalizedProject.missingDataWarnings].sort(
    (a, b) => (severityRank[a.severity] ?? 99) - (severityRank[b.severity] ?? 99)
  );

  return (
    <section className="page-stack intake-workspace">
      <PageHeader
        eyebrow="Project Package Intake"
        title="Upload project evidence"
        description="Drop project files, review parser status, and choose the next engineering workspace."
      />

      <div className="intake-command-grid">
        <UploadDropzone
          inputRef={inputRef}
          isDragging={isDragging}
          fileCount={files.length}
          totalSizeBytes={totalSizeBytes}
          onDragStateChange={setIsDragging}
          onFilesSelected={addFiles}
          onClearFiles={clearFiles}
        />
        <IntakeReadinessPanel
          completeness={completeness}
          mode={mode}
          totalFiles={files.length}
          parsedFiles={parsedFiles}
          warningCount={totalWarningCount}
          hasPcbData={hasPcbData}
          hasFirmwareData={hasFirmwareData}
          hasReport={hasReport}
        />
      </div>

      <IntakeModeSelector
        mode={mode}
        setMode={setMode}
        showFirmwareWarning={showFirmwareWarning}
      />

      <section className="intake-module">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Grouped file inventory</span>
            <h2>Detected project package</h2>
          </div>
          <span className="status-pill">{files.length} file(s)</span>
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <span className="status-pill">No project files loaded</span>
            <p>
              Upload KiCad, BOM, placement, or manufacturing files to populate
              this view. Evidence will appear here after parsing.
            </p>
          </div>
        ) : (
          <div className="inventory-group-stack">
            {displayGroups.map((group) => (
              <FileInventoryGroup
                key={group.id}
                group={group}
                defaultOpen={group.files.length > 0 && ["schematics", "pcb-layouts", "bom", "placement"].includes(group.id)}
                onRemove={removeFile}
              />
            ))}
          </div>
        )}
      </section>

      <ParserStatusAccordion
        stages={normalizedProject.parserResult.stages}
        files={files}
        groups={displayGroups}
      />

      <section className="intake-module">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Warnings and evidence</span>
            <h2>Review signals</h2>
          </div>
          <span className="status-pill">{totalWarningCount} warning(s)</span>
        </div>
        <div className="model-grid">
          <section className="summary-panel">
            <span className="eyebrow">Top missing-data warnings</span>
            {sortedWarnings.slice(0, 3).length ? (
              <div className="stage-list">
                {sortedWarnings.slice(0, 3).map((warning) => (
                  <article key={warning.id} className="stage-row">
                    <div>
                      <strong>{warning.title}</strong>
                      <small>{warning.message}</small>
                    </div>
                    <span className="status-pill">{warning.severity}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No missing-data warnings for the current package.</p>
            )}
            {sortedWarnings.length > 3 ? (
              <details>
                <summary>View all warnings</summary>
                <div className="stage-list">
                  {sortedWarnings.slice(3).map((warning) => (
                    <article key={warning.id} className="stage-row">
                      <div>
                        <strong>{warning.title}</strong>
                        <small>{warning.message}</small>
                        <small>{warning.whyItMatters}</small>
                      </div>
                      <span className="status-pill">{warning.severity}</span>
                    </article>
                  ))}
                </div>
              </details>
            ) : null}
          </section>

          <section className="summary-panel">
            <span className="eyebrow">Analysis and report readiness</span>
            <div className="tag-list">
              <span>Net inventory: {normalizedProject.netInventory.available ? "available" : "missing data"}</span>
              <span>Decoupling: {normalizedProject.analysis.decoupling.available ? "available" : "missing data"}</span>
              <span>Power tree: {normalizedProject.analysis.powerTree.available ? "available" : "missing data"}</span>
              <span>Firmware: {normalizedProject.firmware.manual?.summary.readiness ?? "not-usable"}</span>
              <span>Report: {hasReport ? "available" : "unavailable"}</span>
            </div>
            <p className="muted">
              Analysis status is evidence-based and does not claim electrical,
              DFM, datasheet, or production validation.
            </p>
          </section>
        </div>

        <details className="intake-details-panel">
          <summary>Direct evidence and assumptions</summary>
          <div className="model-grid">
            <section className="model-panel">
              <h3>Direct evidence</h3>
              <div className="stage-list">
                {normalizedProject.directEvidence.length ? (
                  normalizedProject.directEvidence.map((evidence) => (
                    <article key={evidence.id} className="stage-row">
                      <div>
                        <strong>{evidence.title}</strong>
                        <small>{evidence.message}</small>
                      </div>
                      <span className="status-pill">{evidence.confidence}</span>
                    </article>
                  ))
                ) : (
                  <p className="muted">No direct file evidence yet.</p>
                )}
              </div>
            </section>
            <section className="model-panel">
              <h3>Assumptions</h3>
              <div className="stage-list">
                {normalizedProject.assumptions.map((assumption) => (
                  <article key={assumption.id} className="stage-row">
                    <div>
                      <strong>{assumption.title}</strong>
                      <small>{assumption.message}</small>
                    </div>
                    <span className="status-pill">{assumption.confidence}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </details>
      </section>

      <IntakeNextActions
        fileCount={files.length}
        hasPcbData={hasPcbData}
        hasSchematicData={hasSchematicData}
        hasReport={hasReport}
        hasFirmwareData={hasFirmwareData}
      />
    </section>
  );
}
