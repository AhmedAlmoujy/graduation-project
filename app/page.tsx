import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TopAttackersChart } from "@/components/dashboard/TopAttackersChart";
import { ProtocolDistChart } from "@/components/dashboard/ProtocolDistChart";
import { TrafficTimelineChart } from "@/components/dashboard/TrafficTimelineChart";
import { RecentThreatsWidget } from "@/components/dashboard/RecentThreatsWidget";
import { Activity, ShieldAlert, Cpu, Globe } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${url}/api/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  } catch (error) {
    return {
      kpi: { totalThreats: 0, activeSourceIps: 0, avgRiskScore: 0, criticalAlerts: 0, delta: { totalThreats: 0, activeSourceIps: 0, avgRiskScore: 0, criticalAlerts: 0 } },
      topAttackers: [],
      protocolDist: [],
      trafficTimeline: [],
      recentThreats: []
    };
  }
}

export default async function OverviewPage() {
  const stats = await getStats();

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <PageHeader 
        title="Intelligence Overview" 
        description="Real-time aggregation of SOC telemetry and threat analysis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Threats"
          value={stats.kpi?.totalThreats || 0}
          delta={stats.kpi?.delta?.totalThreats || 0}
          icon={<ShieldAlert className="w-5 h-5" />}
          trendText="vs yesterday"
        />
        <KpiCard
          title="Active Source IPs"
          value={stats.kpi?.activeSourceIps || 0}
          delta={stats.kpi?.delta?.activeSourceIps || 0}
          icon={<Activity className="w-5 h-5" />}
          trendText="vs yesterday"
        />
        <KpiCard
          title="Avg Risk Score"
          value={stats.kpi?.avgRiskScore || 0}
          delta={stats.kpi?.delta?.avgRiskScore || 0}
          icon={<Cpu className="w-5 h-5" />}
          trendText="vs yesterday"
          formatType="risk"
        />
        <KpiCard
          title="Critical Alerts"
          value={stats.kpi?.criticalAlerts || 0}
          delta={stats.kpi?.delta?.criticalAlerts || 0}
          icon={<ShieldAlert className="w-5 h-5 text-risk-critical" />}
          trendText="vs yesterday"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-bg-surface border border-border-subtle rounded-md overflow-hidden shadow-sm relative group h-[400px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-bg-surface),_var(--color-bg-base))] flex justify-center items-center">
            <Globe className="w-48 h-48 text-border-strong opacity-20" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-bg-base/60 backdrop-blur-sm">
              <Link href="/map" className="px-6 py-2 bg-accent-cyan text-black font-semibold rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105">
                Open Full Interactive Map
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 p-5 w-full bg-gradient-to-b from-bg-surface/80 to-transparent pointer-events-none">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Global Threat Origin Preview</h3>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <RecentThreatsWidget threats={stats.recentThreats || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopAttackersChart data={stats.topAttackers || []} />
        <ProtocolDistChart data={stats.protocolDist || []} />
        <TrafficTimelineChart data={stats.trafficTimeline || []} />
      </div>
    </div>
  );
}
