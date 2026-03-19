"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { Search } from "lucide-react";

export function LogsFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      ip: parseAsString.withDefault(""),
      method: parseAsString.withDefault("ALL"),
      analyzed: parseAsString.withDefault("All"),
      page: parseAsInteger.withDefault(1),
    },
    { shallow: false }
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-bg-surface p-4 border border-border-subtle rounded-md mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input 
          type="text"
          placeholder="Search full log data..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-9 pr-4 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
        />
      </div>
      
      <div className="w-48">
        <input 
          type="text"
          placeholder="Filter by IP..."
          value={filters.ip}
          onChange={(e) => handleFilterChange("ip", e.target.value)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:font-sans"
        />
      </div>

      <select 
        value={filters.method}
        onChange={(e) => handleFilterChange("method", e.target.value)}
        className="bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
      >
        <option value="ALL">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>

      <select 
        value={filters.analyzed}
        onChange={(e) => handleFilterChange("analyzed", e.target.value)}
        className="bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
      >
        <option value="All">Analyzed: All</option>
        <option value="Analyzed">Yes</option>
        <option value="Unanalyzed">No</option>
      </select>
    </div>
  );
}
