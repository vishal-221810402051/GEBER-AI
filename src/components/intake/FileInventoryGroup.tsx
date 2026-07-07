import type { IntakeDisplayGroup } from "../../features/intake/intakeDisplayTypes";
import { FileInventoryRow } from "./FileInventoryRow";
import { SchematicFileCard } from "./SchematicFileCard";

type FileInventoryGroupProps = Readonly<{
  group: IntakeDisplayGroup;
  defaultOpen?: boolean;
  onRemove: (id: string) => void;
}>;

export function FileInventoryGroup({ group, defaultOpen = false, onRemove }: FileInventoryGroupProps) {
  if (group.files.length === 0) {
    return null;
  }

  return (
    <details className="inventory-group" open={defaultOpen}>
      <summary>
        <span>{group.title}</span>
        <span>{group.files.length} file(s)</span>
        <span>{group.parsedCount} parsed</span>
        <span>{group.warningCount} warning(s)</span>
        <span>{group.failedCount} attention</span>
      </summary>
      <div className="inventory-group-body">
        {group.id === "schematics" && group.files.length > 1 ? (
          <p className="muted">
            Multiple schematic files detected. Each file is shown independently.
            Combined hierarchy aggregation is not implemented yet.
          </p>
        ) : null}
        {group.files.map((item) =>
          group.id === "schematics" ? (
            <SchematicFileCard key={item.file.id} item={item} onRemove={onRemove} />
          ) : (
            <FileInventoryRow key={item.file.id} item={item} onRemove={onRemove} />
          )
        )}
      </div>
    </details>
  );
}
