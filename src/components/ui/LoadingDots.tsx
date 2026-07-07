export type LoadingDotsProps = {
  label?: string;
  size?: "sm" | "md";
};

export function LoadingDots({ label = "Loading", size = "md" }: LoadingDotsProps) {
  return (
    <span className={`loading-dots loading-dots-${size}`} role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </span>
  );
}
