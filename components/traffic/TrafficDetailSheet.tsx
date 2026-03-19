import { TrafficRecord } from "@/types/traffic";
import { formatTimestamp } from "@/lib/utils";
import { X, Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export function TrafficDetailSheet({ record, onClose }: { record: TrafficRecord; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const isAttack = record.label === 1 || String(record.label) === "1" || record.label === "ATTACK";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[450px] max-w-full bg-bg-surface border-l border-border-subtle shadow-2xl z-50 transform transition-transform duration-250 flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary tracking-tight font-sans flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-cyan" />
              Traffic Record
            </h2>
            <p className="text-sm font-mono text-text-secondary mt-1">{record._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-md transition-colors text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className={`p-4 rounded-md border flex items-center gap-3 ${isAttack ? 'bg-risk-critical-dim border-risk-critical/30 text-risk-critical' : 'bg-risk-low-dim border-risk-low/30 text-risk-low'}`}>
            {isAttack ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            <div>
              <div className="font-bold text-sm uppercase tracking-wider">AI Classification</div>
              <div className="text-xs opacity-90 mt-0.5">{isAttack ? "Malicious Activity Detected" : "Normal Benign Traffic"}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-1">Timestamp</label>
              <div className="font-mono text-sm text-text-primary">{formatTimestamp(record.timestamp)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-elevated p-4 rounded-md border border-border-subtle shadow-inner">
                <label className="text-[10px] uppercase tracking-wider text-text-secondary block mb-1">Source</label>
                <div className="font-mono text-sm text-text-primary">{record.src_ip}</div>
                <div className="font-mono text-xs text-text-tertiary mt-2">Port: <span className="text-text-secondary font-semibold">{record.src_port}</span></div>
              </div>
              <div className="bg-bg-elevated p-4 rounded-md border border-border-subtle shadow-inner">
                <label className="text-[10px] uppercase tracking-wider text-text-secondary block mb-1">Destination</label>
                <div className="font-mono text-sm text-accent-cyan">{record.dst_ip}</div>
                <div className="font-mono text-xs text-text-tertiary mt-2">Port: <span className="text-text-secondary font-semibold">{record.dst_port}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-2">Protocol Details</label>
              <div className="flex items-center gap-4">
                <div className="bg-bg-elevated px-4 py-2 rounded-md border border-border-subtle">
                  <span className="font-mono text-xs text-text-secondary uppercase">Proto ID: </span>
                  <span className="font-mono text-sm font-semibold text-text-primary">{record.protocol}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
