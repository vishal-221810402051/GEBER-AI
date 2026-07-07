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
import type {
  AnalysisMode,
  ClassifiedFile,
  CompletenessSummary
} from "./intakeTypes";
import type { NormalizedPCBProject } from "../../domain";

type FileIntakeContextValue = Readonly<{
  files: readonly ClassifiedFile[];
  mode: AnalysisMode;
  completeness: CompletenessSummary;
  addFiles: (files: FileList | readonly File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setMode: (mode: AnalysisMode) => void;
  totalSizeBytes: number;
  normalizedProject: NormalizedPCBProject;
  kicadPcbResults: Readonly<Record<string, KiCadPcbParseResult>>;
  kicadSchematicResults: Readonly<Record<string, KiCadSchematicParseResult>>;
  bomResults: Readonly<Record<string, BomParseResult>>;
  placementResults: Readonly<Record<string, PlacementParseResult>>;
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
  const [mode, setMode] = useState<AnalysisMode>("basic");
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

  const addFiles = useCallback((nextFiles: FileList | readonly File[]) => {
    setFiles((currentFiles) => {
      const byId = new Map(currentFiles.map((file) => [file.id, file]));

      normalizeFiles(nextFiles).forEach((file) => {
        const classified = classifyFile(file);
        byId.set(classified.id, classified);
      });

      return Array.from(byId.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setKicadPcbResults({});
    setKicadSchematicResults({});
    setBomResults({});
    setPlacementResults({});
  }, []);

  const completeness = useMemo(() => calculateCompleteness(files), [files]);
  const normalizedProject = useMemo(
    () =>
      buildNormalizedProject({
        files,
        completeness,
        mode,
        kicadPcbResults,
        kicadSchematicResults,
        bomResults,
        placementResults
      }),
    [
      bomResults,
      completeness,
      files,
      kicadPcbResults,
      kicadSchematicResults,
      mode,
      placementResults
    ]
  );
  const totalSizeBytes = useMemo(
    () => files.reduce((total, file) => total + file.sizeBytes, 0),
    [files]
  );
  const processingState = useMemo(
    () =>
      deriveIntakeProcessingState(files, {
        kicadPcbResults,
        kicadSchematicResults,
        bomResults,
        placementResults
      }),
    [bomResults, files, kicadPcbResults, kicadSchematicResults, placementResults]
  );

  const value = useMemo(
    () => ({
      files,
      mode,
      completeness,
      addFiles,
      removeFile,
      clearFiles,
      setMode,
      totalSizeBytes,
      normalizedProject,
      kicadPcbResults,
      kicadSchematicResults,
      bomResults,
      placementResults,
      processingState
    }),
    [
      addFiles,
      bomResults,
      clearFiles,
      completeness,
      files,
      kicadPcbResults,
      kicadSchematicResults,
      mode,
      normalizedProject,
      placementResults,
      processingState,
      removeFile,
      totalSizeBytes
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
