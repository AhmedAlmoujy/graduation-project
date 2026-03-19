"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function TrafficFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      srcIp: parseAsString.withDefault(""),
      dstIp: parseAsString.withDefault(""),
      port: parseAsInteger,
      protocol: parseAsString.withDefault("ALL"),
      label: parseAsString.withDefault("ALL"),
      page: parseAsInteger.withDefault(1),
    },
    { shallow: false }
  );

  const handleFilterChange = (key: string, value: string | number | null) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-bg-surface p-4 border border-border-subtle rounded-md mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <div className="w-56">
        <input 
          type="text"
          placeholder="Source IP..."
          value={filters.srcIp}
          onChange={(e) => handleFilterChange("srcIp", e.target.value)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:font-sans"
        />
      </div>

      <div className="w-56">
        <input 
          type="text"
          placeholder="Destination IP..."
          value={filters.dstIp}
          onChange={(e) => handleFilterChange("dstIp", e.target.value)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:font-sans"
        />
      </div>

      <div className="w-32">
        <input 
          type="number"
          placeholder="Port..."
          value={filters.port || ""}
          onChange={(e) => handleFilterChange("port", e.target.value ? parseInt(e.target.value) : null)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
        />
      </div>

      <select 
        value={filters.protocol}
        onChange={(e) => handleFilterChange("protocol", e.target.value)}
        className="bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
      >
        <option value="ALL">All Protocols</option>
        <option value="TCP">TCP (6)</option>
        <option value="UDP">UDP (17)</option>
        <option value="ICMP">ICMP (1)</option>
      </select>

      <select 
        value={filters.label}
        onChange={(e) => handleFilterChange("label", e.target.value)}
        className="bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
      >
        <option value="ALL">All Traffic</option>
        <option value="ATTACK">Attack Only</option>
        <option value="BENIGN">Benign Only</option>
      </select>
    </div>
  );
}
