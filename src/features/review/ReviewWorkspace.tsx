import { useMemo, useState } from "react";
import type { NormalizedPCBProject } from "../../domain";
import { buildReviewWorkspaceModel } from "./reviewWorkspaceModel";
import { ReviewAiPanel } from "./ReviewAiPanel";
import { ReviewEvidencePanel } from "./ReviewEvidencePanel";
import { ReviewFilesPanel } from "./ReviewFilesPanel";
import { ReviewFirmwarePanel } from "./ReviewFirmwarePanel";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewLimitationsPanel } from "./ReviewLimitationsPanel";
import { ReviewNextActions } from "./ReviewNextActions";
import { ReviewOverview } from "./ReviewOverview";
import { ReviewRiskPanel } from "./ReviewRiskPanel";
import { ReviewTabs, type ReviewTabId } from "./ReviewTabs";

type ReviewWorkspaceProps = Readonly<{
  normalizedProject: NormalizedPCBProject;
}>;

export function ReviewWorkspace({ normalizedProject }: ReviewWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ReviewTabId>("overview");
  const model = useMemo(
    () => buildReviewWorkspaceModel(normalizedProject),
    [normalizedProject]
  );

  return (
    <section className="page-stack review-workspace">
      <ReviewHeader model={model} />
      <ReviewTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "overview" ? (
        <>
          <ReviewOverview model={model} />
          <ReviewNextActions model={model} />
        </>
      ) : null}
      {activeTab === "files" ? <ReviewFilesPanel model={model} /> : null}
      {activeTab === "evidence" ? <ReviewEvidencePanel model={model} /> : null}
      {activeTab === "risks" ? <ReviewRiskPanel model={model} /> : null}
      {activeTab === "firmware" ? <ReviewFirmwarePanel model={model} /> : null}
      {activeTab === "ai-review" ? (
        <ReviewAiPanel normalizedProject={normalizedProject} model={model} />
      ) : null}
      {activeTab === "limitations" ? <ReviewLimitationsPanel model={model} /> : null}
    </section>
  );
}
