import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { classifyFile } from "./classifyFile";
import { calculateCompleteness } from "./completenessScore";
import { buildNormalizedProject } from "../project-model/buildNormalizedProject";
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
  }, []);

  const completeness = useMemo(() => calculateCompleteness(files), [files]);
  const normalizedProject = useMemo(
    () => buildNormalizedProject({ files, completeness, mode }),
    [completeness, files, mode]
  );
  const totalSizeBytes = useMemo(
    () => files.reduce((total, file) => total + file.sizeBytes, 0),
    [files]
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
      normalizedProject
    }),
    [
      addFiles,
      clearFiles,
      completeness,
      files,
      mode,
      normalizedProject,
      removeFile,
      totalSizeBytes
    ]
  );

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
