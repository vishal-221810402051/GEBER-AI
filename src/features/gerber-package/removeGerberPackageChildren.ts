import type { ClassifiedFile } from "../intake/intakeTypes";

export function removeGerberPackageChildren(
  files: readonly ClassifiedFile[],
  packageId: string
): readonly ClassifiedFile[] {
  return files.filter((file) => file.sourcePackageId !== packageId);
}
