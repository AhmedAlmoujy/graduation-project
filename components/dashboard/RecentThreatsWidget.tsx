import { ThreatReport } from "@/types/report";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { formatTimestamp } from "@/lib/utils";
import Link from "next/link";

export function RecentThreatsWidget({ threats }: { threats: ThreatReport[] }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)] h-[400px] flex flex-col">
      <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-bg-surface">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Recent High-Risk Threats</h3>
      </div>
      <div className="flex-1 overflow-auto p-2 bg-bg-elevated/30">
        {threats.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-tertiary text-sm font-mono">No recent threats.</div>
        ) : (
          <ul className="space-y-1">
            {threats.map((threat) => (
              <li key={threat._id} className="p-3 hover:bg-bg-surface border border-transparent hover:border-border-subtle transition-all rounded-md group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <RiskBadge score={threat.risk_score} />
                    <span className="text-sm font-medium text-text-primary">{threat.threat_category}</span>
                  </div>
                  <span className="text-[11px] text-text-tertiary font-mono">{formatTimestamp(threat.created_at)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-3">
                  <span className="font-mono text-text-secondary bg-bg-elevated px-2 py-0.5 rounded text-[11px] border border-border-subtle">{threat.source_ip}</span>
                  <Link href={`/reports?search=${threat._id}`} className="text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity text-[11px] uppercase tracking-wider font-semibold">
                    Investigate
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
