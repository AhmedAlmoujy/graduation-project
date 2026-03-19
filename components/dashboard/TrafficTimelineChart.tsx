"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TrafficTimelineChartProps {
  data: { date: string; attack: number; benign: number }[];
}

export function TrafficTimelineChart({ data }: TrafficTimelineChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-text-tertiary">No data available</div>;
  }

  const formattedData = data.map(d => ({
    ...d,
    dateShort: d.date.substring(5) 
  }));

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)] h-full">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-6">Traffic Timeline (7 Days)</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--risk-critical)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--risk-critical)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBenign" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--risk-low)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--risk-low)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="dateShort" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)', borderRadius: '6px' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="benign" stroke="var(--risk-low)" fillOpacity={1} fill="url(#colorBenign)" strokeWidth={2} />
            <Area type="monotone" dataKey="attack" stroke="var(--risk-critical)" fillOpacity={1} fill="url(#colorAttack)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
