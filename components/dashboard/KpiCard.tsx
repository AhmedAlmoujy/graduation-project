"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn, formatRiskScore } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  delta: number;
  icon: ReactNode;
  trendText?: string;
  isIncreaseBad?: boolean;
  formatType?: "risk" | "default";
}

export function KpiCard({ 
  title, 
  value, 
  delta, 
  icon, 
  trendText, 
  isIncreaseBad = true,
  formatType = "default"
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(start + (end - start) * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  
  let trendColor = "text-text-tertiary";
  if (!isNeutral) {
    if (isIncreaseBad) {
      trendColor = isPositive ? "text-risk-critical" : "text-risk-low";
    } else {
      trendColor = isPositive ? "text-risk-low" : "text-risk-critical";
    }
  }

  const isDecimal = value % 1 !== 0;
  const formattedDisplay = isDecimal ? Number(displayValue).toFixed(1) : Math.floor(displayValue);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">{title}</h3>
        <div className="text-accent-cyan opacity-80">{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline gap-4">
        <span className="text-3xl font-mono text-text-primary">
          {formatType === "risk" ? formatRiskScore(Number(formattedDisplay)) : formattedDisplay}
        </span>
        <div className={cn("flex items-center text-xs font-medium", trendColor)}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : isNeutral ? <Minus className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(delta) > 0 && <span>{isDecimal ? Math.abs(delta).toFixed(1) : Math.abs(delta)}</span>}
          {trendText && <span className="text-text-tertiary ml-1 font-sans font-normal">{trendText}</span>}
        </div>
      </div>
    </div>
  );
}
