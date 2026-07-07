import { AsyncStageIndicator } from "./AsyncStageIndicator";

export type PipelineStageStatus =
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "error";

export type PipelineStage = {
  id: string;
  label: string;
  description?: string;
  status: PipelineStageStatus;
};

export type PipelineStepperProps = {
  stages: PipelineStage[];
  compact?: boolean;
};

export function PipelineStepper({ stages, compact = false }: PipelineStepperProps) {
  return (
    <div className={`pipeline-stepper ${compact ? "pipeline-stepper-compact" : ""}`}>
      {stages.map((stage) => (
        <AsyncStageIndicator
          key={stage.id}
          label={stage.label}
          status={stage.status}
          detail={compact ? undefined : stage.description}
        />
      ))}
    </div>
  );
}
