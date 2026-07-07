import { PipelineStepper, type PipelineStage } from "./PipelineStepper";

export type ParserProgressTimelineProps = {
  stages: PipelineStage[];
  title?: string;
  compact?: boolean;
};

export function ParserProgressTimeline({
  stages,
  title = "Processing timeline",
  compact = false
}: ParserProgressTimelineProps) {
  return (
    <section className="parser-progress-timeline" aria-label={title}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Local processing</span>
          <h2>{title}</h2>
        </div>
      </div>
      <PipelineStepper stages={stages} compact={compact} />
    </section>
  );
}
