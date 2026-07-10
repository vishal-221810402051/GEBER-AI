import { useMemo, useRef, useState } from "react";
import { AdvancedEvidenceDisclosure } from "../../components/intake/AdvancedEvidenceDisclosure";
import { FileInventoryGroup } from "../../components/intake/FileInventoryGroup";
import { LandingPrimaryAction } from "../../components/intake/LandingPrimaryAction";
import { LandingReadinessSummary } from "../../components/intake/LandingReadinessSummary";
import { PublicModeSelector } from "../../components/intake/PublicModeSelector";
import { UploadDropzone } from "../../components/intake/UploadDropzone";
import { ProcessingOverlay } from "../../components/ui";
import { buildLandingReadiness } from "./landingReadiness";
import { groupFilesForDisplay } from "./groupFilesForDisplay";
import {
  buildIntakePipelineStages,
  toPipelineStages
} from "./intakePipelineStages";
import {
  fromInternalIntakeMode,
  toInternalIntakeMode
} from "./publicModeAdapter";
import { useFileIntake } from "./useFileIntake";

export function LandingIntakeWorkspace() {
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
    placementResults,
    processingState,
    removeFile,
    setMode,
    totalSizeBytes
  } = useFileIntake();

  const publicMode = fromInternalIntakeMode(mode);
  const readiness = useMemo(
    () => buildLandingReadiness(publicMode, files),
    [files, publicMode]
  );

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

  const intakePipelineModel = useMemo(
    () =>
      buildIntakePipelineStages({
        files,
        mode,
        normalizedProject,
        parserResults: {
          bomResults,
          kicadPcbResults,
          kicadSchematicResults,
          placementResults
        },
        processingState
      }),
    [
      bomResults,
      files,
      kicadPcbResults,
      kicadSchematicResults,
      mode,
      normalizedProject,
      placementResults,
      processingState
    ]
  );
  const intakePipelineStages = useMemo(
    () => toPipelineStages(intakePipelineModel),
    [intakePipelineModel]
  );

  const parsedFiles = displayGroups.reduce((count, group) => count + group.parsedCount, 0);
  const parserWarningCount = displayGroups.reduce((count, group) => count + group.warningCount, 0);
  const totalWarningCount = parserWarningCount + normalizedProject.missingDataWarnings.length;
  const firmwareSummary = normalizedProject.firmware.manual?.summary;

  return (
    <section className="landing-intake-workspace">
      <ProcessingOverlay
        active={processingState.active}
        title={processingState.title}
        message={processingState.message}
        progress={processingState.progress}
        stages={intakePipelineStages}
      />

      <div className="landing-intake-grid">
        <div className="landing-intake-left">
          <section className="landing-identity-panel">
            <span className="eyebrow">Local-first PCB review</span>
            <h1>GEBER AI</h1>
            <p>
              Choose an output mode, upload schematic and manufacturing evidence,
              then generate one evidence-based engineering output.
            </p>
          </section>

          <PublicModeSelector
            mode={publicMode}
            onModeChange={(nextMode) => setMode(toInternalIntakeMode(nextMode))}
          />

          <LandingReadinessSummary
            readiness={readiness}
            completeness={completeness}
            totalFiles={files.length}
            parsedFiles={parsedFiles}
            warningCount={totalWarningCount}
            firmwareSummary={firmwareSummary}
          />

          <LandingPrimaryAction readiness={readiness} />

          <p className="landing-privacy-note">
            Files are read in this browser session for deterministic local parsing.
            The optional AI review remains a separate consent-gated report action.
          </p>
        </div>

        <div className="landing-upload-stack">
          <UploadDropzone
            inputRef={inputRef}
            isDragging={isDragging}
            fileCount={files.length}
            totalSizeBytes={totalSizeBytes}
            onDragStateChange={setIsDragging}
            onFilesSelected={addFiles}
            onClearFiles={clearFiles}
          />

          <AdvancedEvidenceDisclosure />

          <section className="landing-inventory-shell" aria-label="Selected file inventory">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Selected evidence</span>
                <h2>File inventory</h2>
              </div>
              <span className="status-pill">{files.length} file(s)</span>
            </div>

            {files.length === 0 ? (
              <div className="empty-state compact-empty-state">
                <span className="status-pill">No files selected</span>
                <p>
                  Add schematic and manufacturing files to unlock the primary
                  action. Parser diagnostics stay collapsed after files are loaded.
                </p>
              </div>
            ) : (
              <div className="inventory-group-stack">
                {displayGroups.map((group) => (
                  <FileInventoryGroup
                    key={group.id}
                    group={group}
                    defaultOpen={group.files.length > 0}
                    onRemove={removeFile}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
