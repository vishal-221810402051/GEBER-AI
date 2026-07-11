import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { classifyFile } from "./classifyFile";
import { calculateCompleteness } from "./completenessScore";
import {
  buildProjectInputPackage,
  type ProjectInputPackage,
  type ProjectMode
} from "../../domain/workflow";
import { buildNormalizedProject } from "../project-model/buildNormalizedProject";
import { parseKicadPcb } from "../parsers/kicad-pcb/parseKicadPcb";
import { parseKicadSchematic } from "../parsers/kicad-schematic/parseKicadSchematic";
import { parseBom } from "../parsers/bom/parseBom";
import { parsePlacement } from "../parsers/placement/parsePlacement";
import { deriveIntakeProcessingState, type IntakeProcessingState } from "./intakePipelineStages";
import type { KiCadPcbParseResult } from "../parsers/kicad-pcb/kicadPcbTypes";
import type { KiCadSchematicParseResult } from "../parsers/kicad-schematic/kicadSchematicTypes";
import type { BomParseResult } from "../parsers/bom/bomTypes";
import type { PlacementParseResult } from "../parsers/placement/placementTypes";
import { parseGerber, type GerberParseResult } from "../parsers/gerber";
import type {
  ClassifiedFile,
  CompletenessSummary
} from "./intakeTypes";
import type { NormalizedPCBProject } from "../../domain";
import { runProjectWorkflow, type ProjectWorkflowResult } from "../workflow";
import {
  extractGerberPackage,
  removeGerberPackageChildren,
  type GerberPackageRecord
} from "../gerber-package";

type FileIntakeContextValue = Readonly<{
  files: readonly ClassifiedFile[];
  mode: ProjectMode;
  inputPackage: ProjectInputPackage;
  completeness: CompletenessSummary;
  addFiles: (files: FileList | readonly File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setMode: (mode: ProjectMode) => void;
  totalSizeBytes: number;
  gerberPackages: readonly GerberPackageRecord[];
  isExtractingGerberPackage: boolean;
  gerberPackageError: string | null;
  removeGerberPackage: (packageId: string) => void;
  normalizedProject: NormalizedPCBProject;
  workflowResult: ProjectWorkflowResult | null;
  runSelectedWorkflow: () => ProjectWorkflowResult;
  clearWorkflowResult: () => void;
  kicadPcbResults: Readonly<Record<string, KiCadPcbParseResult>>;
  kicadSchematicResults: Readonly<Record<string, KiCadSchematicParseResult>>;
  bomResults: Readonly<Record<string, BomParseResult>>;
  placementResults: Readonly<Record<string, PlacementParseResult>>;
  gerberParserResults: Readonly<Record<string, GerberParseResult>>;
  processingState: IntakeProcessingState;
}>;

const FileIntakeContext = createContext<FileIntakeContextValue | null>(null);

type FileIntakeProviderProps = Readonly<{
  children: ReactNode;
}>;

function normalizeFiles(files: FileList | readonly File[]): File[] {
  return Array.from(files);
}

export function FileIntakeProvider({ children }: FileIntakeProviderProps) {
  const [files, setFiles] = useState<readonly ClassifiedFile[]>([]);
  const [mode, setProjectMode] = useState<ProjectMode>("inspect");
  const [workflowResult, setWorkflowResult] = useState<ProjectWorkflowResult | null>(null);
  const [gerberPackages, setGerberPackages] = useState<readonly GerberPackageRecord[]>([]);
  const [extractingPackageCount, setExtractingPackageCount] = useState(0);
  const [gerberPackageError, setGerberPackageError] = useState<string | null>(null);
  const [kicadPcbResults, setKicadPcbResults] = useState<
    Readonly<Record<string, KiCadPcbParseResult>>
  >({});
  const [kicadSchematicResults, setKicadSchematicResults] = useState<
    Readonly<Record<string, KiCadSchematicParseResult>>
  >({});
  const [bomResults, setBomResults] = useState<Readonly<Record<string, BomParseResult>>>({});
  const [placementResults, setPlacementResults] = useState<
    Readonly<Record<string, PlacementParseResult>>
  >({});
  const [gerberParserResults, setGerberParserResults] = useState<
    Readonly<Record<string, GerberParseResult>>
  >({});

  const processGerberPackage = useCallback((packageFile: File) => {
    setWorkflowResult(null);
    setGerberPackageError(null);
    setExtractingPackageCount((count) => count + 1);

    void extractGerberPackage(packageFile)
      .then(({ record, gerberFiles }) => {
        setGerberPackages((current) => [
          ...current.filter((item) => item.id !== record.id),
          record
        ].sort((a, b) => a.fileName.localeCompare(b.fileName)));
        setFiles((currentFiles) => {
          const withoutPackageChildren = removeGerberPackageChildren(currentFiles, record.id);
          const byId = new Map(withoutPackageChildren.map((file) => [file.id, file]));

          gerberFiles.forEach((file) => {
            byId.set(file.id, file);
          });

          return Array.from(byId.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });

        if (record.status === "error") {
          setGerberPackageError(record.diagnostics[0] ?? "Gerber package extraction failed.");
        }
      })
      .catch(() => {
        setGerberPackageError("Gerber package extraction failed. Choose another package or upload individual Gerber files.");
      })
      .finally(() => {
        setExtractingPackageCount((count) => Math.max(0, count - 1));
      });
  }, []);

  const addFiles = useCallback((nextFiles: FileList | readonly File[]) => {
    setWorkflowResult(null);
    setGerberPackageError(null);
    const normalizedFiles = normalizeFiles(nextFiles);
    const classifiedFiles = normalizedFiles.map((file) => ({
      file,
      classified: classifyFile(file)
    }));
    const packageFiles = classifiedFiles
      .filter((item) => item.classified.category === "archive")
      .map((item) => item.file);
    const regularFiles = classifiedFiles
      .filter((item) => item.classified.category !== "archive")
      .map((item) => item.classified);

    packageFiles.forEach(processGerberPackage);

    setFiles((currentFiles) => {
      const byId = new Map(currentFiles.map((file) => [file.id, file]));

      regularFiles.forEach((classified) => {
        byId.set(classified.id, classified);
      });

      return Array.from(byId.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }, [processGerberPackage]);

  const removeFile = useCallback((id: string) => {
    setWorkflowResult(null);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setWorkflowResult(null);
    setGerberPackageError(null);
    setFiles([]);
    setGerberPackages([]);
    setKicadPcbResults({});
    setKicadSchematicResults({});
    setBomResults({});
    setPlacementResults({});
    setGerberParserResults({});
  }, []);

  const setMode = useCallback((nextMode: ProjectMode) => {
    setWorkflowResult(null);
    setProjectMode(nextMode);
  }, []);

  const completeness = useMemo(() => calculateCompleteness(files), [files]);
  const inputPackage = useMemo(() => buildProjectInputPackage(files), [files]);
  const normalizedProject = useMemo(
    () =>
      buildNormalizedProject({
        files,
        completeness,
        mode,
        kicadPcbResults,
        kicadSchematicResults,
        bomResults,
        placementResults,
        gerberParserResults
      }),
    [
      bomResults,
      completeness,
      files,
      kicadPcbResults,
      kicadSchematicResults,
      mode,
      placementResults,
      gerberParserResults
    ]
  );
  const totalSizeBytes = useMemo(
    () => files.reduce((total, file) => total + file.sizeBytes, 0),
    [files]
  );
  const processingState = useMemo(
    () =>
      extractingPackageCount > 0
        ? {
            active: true,
            title: "Extracting Gerber package",
            message: `${extractingPackageCount} package(s) are being extracted and classified locally in this browser.`,
            currentStage: "Gerber package intake"
          }
        : deriveIntakeProcessingState(files, {
            kicadPcbResults,
            kicadSchematicResults,
            bomResults,
            placementResults,
            gerberParserResults
          }),
    [bomResults, extractingPackageCount, files, gerberParserResults, kicadPcbResults, kicadSchematicResults, placementResults]
  );
  const removeGerberPackage = useCallback((packageId: string) => {
    setWorkflowResult(null);
    setGerberPackageError(null);
    setGerberPackages((current) => current.filter((record) => record.id !== packageId));
    setFiles((currentFiles) => removeGerberPackageChildren(currentFiles, packageId));
    setGerberParserResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([, result]) => result.sourcePackageId !== packageId)
      );
      return next;
    });
  }, []);
  const clearWorkflowResult = useCallback(() => {
    setWorkflowResult(null);
  }, []);
  const runSelectedWorkflow = useCallback(() => {
    const result = runProjectWorkflow({
      mode,
      inputPackage,
      normalizedProject
    });

    setWorkflowResult(result);
    return result;
  }, [inputPackage, mode, normalizedProject]);

  const value = useMemo(
    () => ({
      files,
      mode,
      inputPackage,
      completeness,
      addFiles,
      removeFile,
      clearFiles,
      setMode,
      totalSizeBytes,
      gerberPackages,
      isExtractingGerberPackage: extractingPackageCount > 0,
      gerberPackageError,
      removeGerberPackage,
      normalizedProject,
      workflowResult,
      runSelectedWorkflow,
      clearWorkflowResult,
      kicadPcbResults,
      kicadSchematicResults,
      bomResults,
      placementResults,
      gerberParserResults,
      processingState
    }),
    [
      addFiles,
      bomResults,
      clearFiles,
      clearWorkflowResult,
      completeness,
      extractingPackageCount,
      files,
      gerberPackageError,
      gerberPackages,
      gerberParserResults,
      inputPackage,
      kicadPcbResults,
      kicadSchematicResults,
      mode,
      normalizedProject,
      placementResults,
      processingState,
      removeFile,
      removeGerberPackage,
      runSelectedWorkflow,
      setMode,
      totalSizeBytes,
      workflowResult
    ]
  );

  useEffect(() => {
    let cancelled = false;
    const kicadFiles = files.filter((file) => file.category === "kicad-pcb");
    const kicadIds = new Set(kicadFiles.map((file) => file.id));

    setKicadPcbResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => kicadIds.has(id))
      );
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });

    kicadFiles.forEach((classifiedFile) => {
      if (kicadPcbResults[classifiedFile.id]) {
        return;
      }

      classifiedFile.file
        .text()
        .then((text) => parseKicadPcb(text, classifiedFile.id, classifiedFile.name))
        .catch((): KiCadPcbParseResult =>
          parseKicadPcb(
            "",
            classifiedFile.id,
            classifiedFile.name
          )
        )
        .then((result) => {
          if (cancelled) {
            return;
          }

          setKicadPcbResults((current) => ({
            ...current,
            [classifiedFile.id]: result
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [files, kicadPcbResults]);

  useEffect(() => {
    let cancelled = false;
    const schematicFiles = files.filter((file) => file.category === "kicad-schematic");
    const schematicIds = new Set(schematicFiles.map((file) => file.id));

    setKicadSchematicResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => schematicIds.has(id))
      );
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });

    schematicFiles.forEach((classifiedFile) => {
      if (kicadSchematicResults[classifiedFile.id]) {
        return;
      }

      classifiedFile.file
        .text()
        .then((text) =>
          parseKicadSchematic(text, classifiedFile.id, classifiedFile.name)
        )
        .catch((): KiCadSchematicParseResult =>
          parseKicadSchematic("", classifiedFile.id, classifiedFile.name)
        )
        .then((result) => {
          if (cancelled) {
            return;
          }

          setKicadSchematicResults((current) => ({
            ...current,
            [classifiedFile.id]: result
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [files, kicadSchematicResults]);

  useEffect(() => {
    let cancelled = false;
    const bomFiles = files.filter((file) => file.category === "bom");
    const bomIds = new Set(bomFiles.map((file) => file.id));

    setBomResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => bomIds.has(id))
      );
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });

    bomFiles.forEach((classifiedFile) => {
      if (bomResults[classifiedFile.id]) {
        return;
      }

      classifiedFile.file
        .text()
        .then((text) => parseBom(text, classifiedFile.id, classifiedFile.name))
        .catch((): BomParseResult => parseBom("", classifiedFile.id, classifiedFile.name))
        .then((result) => {
          if (!cancelled) {
            setBomResults((current) => ({ ...current, [classifiedFile.id]: result }));
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [bomResults, files]);

  useEffect(() => {
    let cancelled = false;
    const placementFiles = files.filter((file) => file.category === "pick-and-place");
    const placementIds = new Set(placementFiles.map((file) => file.id));

    setPlacementResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => placementIds.has(id))
      );
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });

    placementFiles.forEach((classifiedFile) => {
      if (placementResults[classifiedFile.id]) {
        return;
      }

      classifiedFile.file
        .text()
        .then((text) => parsePlacement(text, classifiedFile.id, classifiedFile.name))
        .catch((): PlacementParseResult =>
          parsePlacement("", classifiedFile.id, classifiedFile.name)
        )
        .then((result) => {
          if (!cancelled) {
            setPlacementResults((current) => ({
              ...current,
              [classifiedFile.id]: result
            }));
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [files, placementResults]);

  useEffect(() => {
    let cancelled = false;
    const gerberFiles = files.filter((file) => file.category === "gerber" || file.category === "gerber-x2");
    const gerberIds = new Set(gerberFiles.map((file) => file.id));

    setGerberParserResults((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => gerberIds.has(id))
      );
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });

    gerberFiles.forEach((classifiedFile) => {
      if (gerberParserResults[classifiedFile.id]) {
        return;
      }

      setWorkflowResult(null);
      classifiedFile.file
        .text()
        .then((text) => parseGerber(text, classifiedFile.id, classifiedFile.name, classifiedFile))
        .catch((): GerberParseResult =>
          parseGerber("", classifiedFile.id, classifiedFile.name, classifiedFile)
        )
        .then((result) => {
          if (!cancelled) {
            setGerberParserResults((current) => ({
              ...current,
              [classifiedFile.id]: result
            }));
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [files, gerberParserResults]);

  return (
    <FileIntakeContext.Provider value={value}>
      {children}
    </FileIntakeContext.Provider>
  );
}

export function useFileIntake() {
  const context = useContext(FileIntakeContext);

  if (!context) {
    throw new Error("useFileIntake must be used within FileIntakeProvider.");
  }

  return context;
}
