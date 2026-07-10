import { AiReviewPanel } from "../ai/components/AiReviewPanel";
import type { NormalizedPCBProject } from "../../domain";
import type { ReviewWorkspaceModel } from "./reviewWorkspaceModel";

type ReviewAiPanelProps = Readonly<{
  normalizedProject: NormalizedPCBProject;
  model: ReviewWorkspaceModel;
}>;

export function ReviewAiPanel({ normalizedProject, model }: ReviewAiPanelProps) {
  return (
    <div id="ai-review">
      <AiReviewPanel
        normalizedProject={normalizedProject}
        reportAvailable={model.report.available}
      />
    </div>
  );
}
