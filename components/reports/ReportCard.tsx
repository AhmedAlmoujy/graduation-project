"use client";

import { ThreatReport } from "@/types/report";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { formatTimestamp } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useState } from "react";
import { ReportDetailDialog } from "./ReportDetailDialog";

export function ReportCard({ report }: { report: ThreatReport }) {
  const [isOpen, setIsOpen] = useState(false);

  let stripeColor = "bg-risk-low";
  if (report.risk_score >= 8) stripeColor = "bg-risk-critical";
  else if (report.risk_score >= 6) stripeColor = "bg-risk-high";
  else if (report.risk_score >= 4) stripeColor = "bg-risk-medium";

  return (
    <>
      <div className="bg-bg-surface border border-border-subtle rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:shadow-lg transition-all flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className={`absolute right-0 top-0 bottom-0 w-1 ${stripeColor} opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_var(--color-risk-critical)]`} />
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-2">
              <RiskBadge score={report.risk_score} className="w-fit" />
              <div className="font-semibold text-text-primary text-base truncate pr-2 mt-1">{report.threat_category}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5 mt-1 bg-bg-elevated/50 rounded-md p-3 border border-border-subtle shadow-inner">
            <div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 font-semibold">Origin IP</div>
              <div className="font-mono text-accent-cyan text-xs">{report.source_ip || "Unknown"}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 font-semibold">Detected At</div>
              <div className="font-mono text-text-secondary text-xs truncate" title={formatTimestamp(report.created_at)}>{formatTimestamp(report.created_at)}</div>
            </div>
          </div>

          <div className="mb-5 flex-1">
            <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">AI Insights</div>
            <div className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
              {report.ai_insights || "Analysis pending."}
            </div>
          </div>

          {report.recommendations && report.recommendations.length > 0 && (
            <div className="mb-6">
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Actions Needed</div>
              <ul className="space-y-2">
                {report.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i} className="text-[13px] text-text-primary flex items-start gap-2 leading-tight">
                    <span className="text-accent-cyan mt-0">&bull;</span>
                    <span className="truncate">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <button 
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 pr-1 bg-bg-elevated hover:bg-border-subtle text-text-primary text-[13px] uppercase tracking-wider font-semibold border border-border-strong rounded transition-all group-hover:border-accent-cyan/50 group-hover:text-accent-cyan shadow-sm"
            >
              <FileText className="w-4 h-4 mb-0.5" />
              View Full Report
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <ReportDetailDialog report={report} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
