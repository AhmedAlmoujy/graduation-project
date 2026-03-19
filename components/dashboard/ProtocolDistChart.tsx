"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ProtocolDistChartProps {
  data: { protocol: number; count: number }[];
}

const COLORS = ['var(--accent-cyan)', 'var(--risk-medium)', 'var(--risk-high)', 'var(--text-tertiary)'];

export function ProtocolDistChart({ data }: ProtocolDistChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-text-tertiary">No data available</div>;
  }

  const formattedData = data.map(d => ({
    name: d.protocol === 6 ? "TCP" : d.protocol === 17 ? "UDP" : d.protocol === 1 ? "ICMP" : `Proto ${d.protocol}`,
    value: d.count
  }));

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-5 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)] h-full">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-6">Protocol Distribution</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)', borderRadius: '6px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
