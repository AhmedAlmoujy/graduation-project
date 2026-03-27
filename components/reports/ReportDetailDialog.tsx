import { ThreatReport } from "@/types/report";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { formatTimestamp } from "@/lib/utils";
import { X, Copy, Download, ShieldAlert, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function ReportDetailDialog({ report, onClose }: { report: ThreatReport; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.ai_insights);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-report-${report._id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let stripeColor = "bg-risk-low";
  if (report.risk_score >= 8) stripeColor = "bg-risk-critical";
  else if (report.risk_score >= 6) stripeColor = "bg-risk-high";
  else if (report.risk_score >= 4) stripeColor = "bg-risk-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl h-[85vh] bg-bg-surface border border-border-strong shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className={`absolute top-0 left-0 w-full h-[6px] ${stripeColor}`} />
        
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-surface shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-md bg-bg-elevated border border-border-subtle shadow-inner`}>
              <ShieldAlert className={`w-6 h-6 ${report.risk_score >= 8 ? 'text-risk-critical' : report.risk_score >= 6 ? 'text-risk-high' : 'text-text-primary'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary tracking-tight font-sans">
                {report.threat_category}
              </h2>
              <p className="text-xs font-mono text-text-tertiary mt-1">ID: {report.report_id || report._id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-border-subtle border border-border-strong rounded-md text-sm font-medium transition-colors text-text-primary">
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-md transition-colors text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[radial-gradient(ellipse_at_top,var(--color-bg-elevated),transparent)] relative">
          <div className="grid grid-cols-4 gap-6 relative z-10">
            <div className="col-span-1 p-5 bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-md shadow-sm">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary block mb-3">Risk Status</label>
              <RiskBadge score={report.risk_score} className="text-[13px] px-3 py-1" />
              <div className="mt-3 text-xs font-mono text-text-secondary">Score: {report.risk_score.toFixed(1)}/10.0</div>
            </div>
            <div className="col-span-1 p-5 bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-md shadow-sm">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary block mb-3">Validation</label>
              <div className={`font-semibold text-sm ${report.is_true_positive ? "text-risk-critical" : "text-risk-low"}`}>
                {report.is_true_positive ? "TRUE POSITIVE" : "FALSE POSITIVE"}
              </div>
            </div>
            <div className="col-span-1 p-5 bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-md shadow-sm">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary block mb-3">Origin Node</label>
              <div className="font-mono text-accent-cyan text-base">{report.source_ip}</div>
            </div>
            <div className="col-span-1 p-5 bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-md shadow-sm">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary block mb-3">Detected At</label>
              <div className="font-mono text-text-primary text-[13px]">{formatTimestamp(report.created_at)}</div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-lg font-semibold text-text-primary font-sans">AI Analysis Insights</h3>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 bg-bg-elevated rounded border border-border-subtle hover:border-accent-cyan transition-colors text-text-secondary hover:text-text-primary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-risk-low" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="text-text-secondary leading-relaxed font-sans text-[15px] whitespace-pre-wrap p-6 bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-md shadow-inner text-justify">
              {report.ai_insights || "No AI insights generated for this report."}
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            <h3 className="text-lg font-semibold text-text-primary font-sans border-b border-border-subtle pb-3">Mitigation Playbook</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {report.recommendations && report.recommendations.length > 0 ? (
                report.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-4 p-5 bg-bg-surface border border-border-subtle rounded-md shadow-sm relative overflow-hidden group hover:border-accent-cyan/40 transition-colors">
                    <span className="w-7 h-7 rounded bg-accent-cyan-dim text-accent-cyan flex items-center justify-center text-[13px] font-bold shrink-0 font-mono mt-0.5 border border-accent-cyan/10 group-hover:bg-accent-cyan group-hover:text-black transition-colors">{i + 1}</span>
                    <span className="text-sm text-text-primary leading-relaxed">{rec}</span>
                  </li>
                ))
              ) : (
                <div className="col-span-2 text-text-tertiary text-sm">No specific recommendations provided.</div>
              )}
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t border-border-strong relative z-10">
            <h3 className="text-[11px] uppercase tracking-[0.08em] font-semibold text-text-tertiary">Correlated Event IDs</h3>
            <div className="flex flex-wrap gap-2">
              {report.log_ids && report.log_ids.length > 0 ? (
                report.log_ids.map(id => (
                  <span key={id} className="px-3 py-1.5 bg-bg-surface border border-border-subtle shadow-sm rounded text-[11px] font-mono text-text-secondary cursor-pointer hover:border-accent-cyan transition-colors">
                    {id}
                  </span>
                ))
              ) : (
                <span className="text-sm border border-transparent text-text-secondary">No raw events attached to this report.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
