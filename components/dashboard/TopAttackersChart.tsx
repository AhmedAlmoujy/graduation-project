"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TopAttackersChartProps {
  data: { ip: string; count: number }[];
}

export function TopAttackersChart({ data }: TopAttackersChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-text-tertiary">No data available</div>;
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)] h-full">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-6">Top 10 Attacking IPs</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="ip" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--bg-elevated)' }}
              contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)', borderRadius: '6px' }}
              itemStyle={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--risk-critical)' : index < 3 ? 'var(--risk-high)' : 'var(--accent-cyan)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
