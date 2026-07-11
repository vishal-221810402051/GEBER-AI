export type ProjectMode = "inspect" | "firmware";

export type ProjectModeDefinition = Readonly<{
  id: ProjectMode;
  label: string;
  description: string;
  actionLabel: string;
}>;

export const PROJECT_MODE_DEFINITIONS = {
  inspect: {
    id: "inspect",
    label: "Inspect / Analysis",
    description: "Inspect schematic and Gerber evidence and generate an engineering report.",
    actionLabel: "Process inspection"
  },
  firmware: {
    id: "firmware",
    label: "Firmware",
    description: "Investigate schematic and Gerber evidence and generate a master firmware-development document.",
    actionLabel: "Build firmware document"
  }
} satisfies Record<ProjectMode, ProjectModeDefinition>;

export type LocalDesignFile = Readonly<{
  id: string;
  name: string;
  category: string;
}>;

export type ProjectInputPackage = Readonly<{
  schematicFiles: readonly LocalDesignFile[];
  gerberFiles: readonly LocalDesignFile[];
}>;

export function buildProjectInputPackage(
  files: readonly LocalDesignFile[]
): ProjectInputPackage {
  return {
    schematicFiles: files.filter((file) => file.category === "kicad-schematic"),
    gerberFiles: files.filter((file) =>
      file.category === "gerber" ||
      file.category === "gerber-x2"
    )
  };
}
