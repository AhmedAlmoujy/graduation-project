import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
  className?: string;
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
  let level = "LOW";
  let classes = "bg-risk-low-dim text-risk-low border border-risk-low/20";
  
  if (score >= 8) {
    level = "CRITICAL";
    classes = "bg-risk-critical-dim text-risk-critical border border-risk-critical/20";
  } else if (score >= 6) {
    level = "HIGH";
    classes = "bg-risk-high-dim text-risk-high border border-risk-high/20";
  } else if (score >= 4) {
    level = "MEDIUM";
    classes = "bg-risk-medium-dim text-risk-medium border border-risk-medium/20";
  }

  return (
    <span className={cn("font-mono text-[11px] font-semibold uppercase px-2 py-0.5 rounded-sm", classes, className)}>
      {level}
    </span>
  );
}
