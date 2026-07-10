export type ReviewTabId =
  | "overview"
  | "files"
  | "evidence"
  | "risks"
  | "firmware"
  | "ai-review"
  | "limitations";

const tabs: Array<{ id: ReviewTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "files", label: "Files" },
  { id: "evidence", label: "Evidence" },
  { id: "risks", label: "Risks" },
  { id: "firmware", label: "Firmware" },
  { id: "ai-review", label: "AI Review" },
  { id: "limitations", label: "Limitations" }
];

type ReviewTabsProps = Readonly<{
  activeTab: ReviewTabId;
  onTabChange: (tab: ReviewTabId) => void;
}>;

export function ReviewTabs({ activeTab, onTabChange }: ReviewTabsProps) {
  return (
    <div className="review-tabs" role="tablist" aria-label="Review workspace sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "review-tab active" : "review-tab"}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
