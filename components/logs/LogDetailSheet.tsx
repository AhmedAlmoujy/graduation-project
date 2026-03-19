import { LogEntry } from "@/types/log";
import { formatTimestamp } from "@/lib/utils";
import { X, Copy, Code, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function LogDetailSheet({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[600px] max-w-full bg-bg-surface border-l border-border-subtle shadow-2xl z-50 transform transition-transform duration-250 flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary tracking-tight font-sans flex items-center gap-2">
              <Code className="w-5 h-5 text-accent-cyan" />
              Log Inspection
            </h2>
            <p className="text-sm font-mono text-text-secondary mt-1">{log._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-md transition-colors text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-1">Timestamp</label>
              <div className="font-mono text-sm text-text-primary">{formatTimestamp(log.received_at)}</div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-1">Source IP</label>
              <div className="font-mono text-sm text-accent-cyan bg-accent-cyan-dim inline-block px-2 py-0.5 rounded border border-accent-cyan/20">{log.source_ip}</div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-1">Method</label>
              <div className="text-sm text-text-primary font-mono">{log.method}</div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-1">Target Host</label>
              <div className="text-sm text-text-primary font-mono truncate">{log.host}</div>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-2">Request URL</label>
            <div className="bg-bg-elevated p-3 rounded-md border border-border-subtle font-mono text-sm text-text-primary break-all">
              {log.url}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block mb-2">User Agent</label>
            <div className="bg-bg-elevated p-3 rounded-md border border-border-subtle font-mono text-sm text-text-secondary break-all">
              {log.user_agent}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-text-tertiary block">Raw Payload (JSON)</label>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-risk-low" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Payload"}
              </button>
            </div>
            <pre className="bg-[#0D1117] p-4 rounded-md border border-border-subtle font-mono text-[13px] text-text-secondary overflow-x-auto custom-scrollbar">
              <code dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON.parse(log.decoded_data || "{}"), null, 2)
                .replace(/"(.*?)":/g, '<span class="text-[#7EE787]">"$1"</span>:')
                .replace(/: "(.*?)"/g, ': <span class="text-[#A5D6FF]">"$1"</span>')
                .replace(/: ([0-9]+)/g, ': <span class="text-[#79C0FF]">$1</span>')
              }} />
            </pre>
          </div>
          
        </div>
      </div>
    </>
  );
}
