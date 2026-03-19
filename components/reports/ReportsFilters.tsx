"use client";

import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";

interface ReportsFiltersProps {
  categories: string[];
}

export function ReportsFilters({ categories }: ReportsFiltersProps) {
  const [filters, setFilters] = useQueryStates(
    {
      riskLevel: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      truePositive: parseAsBoolean,
    },
    { shallow: false }
  );

  const riskLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const handleRiskChange = (level: string) => {
    const current = filters.riskLevel ? filters.riskLevel.split(",") : [];
    if (current.includes(level)) {
      const updated = current.filter(l => l !== level);
      setFilters({ riskLevel: updated.length ? updated.join(",") : null });
    } else {
      setFilters({ riskLevel: [...current, level].join(",") });
    }
  };

  const handleCategoryChange = (cat: string) => {
    const current = filters.category ? filters.category.split(",") : [];
    if (current.includes(cat)) {
      const updated = current.filter(c => c !== cat);
      setFilters({ category: updated.length ? updated.join(",") : null });
    } else {
      setFilters({ category: [...current, cat].join(",") });
    }
  };

  return (
    <div className="bg-bg-surface p-5 border border-border-subtle rounded-md mb-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        
        <div>
          <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary mb-3 block">Risk Level</label>
          <div className="flex flex-wrap gap-2">
            {riskLevels.map(level => {
              const isActive = filters.riskLevel?.includes(level);
              return (
                <button
                  key={level}
                  onClick={() => handleRiskChange(level)}
                  className={`px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full border transition-colors ${
                    isActive 
                    ? level === "CRITICAL" ? "bg-risk-critical text-white border-risk-critical"
                    : level === "HIGH" ? "bg-risk-high text-white border-risk-high"
                    : level === "MEDIUM" ? "bg-risk-medium text-black border-risk-medium"
                    : "bg-risk-low text-white border-risk-low"
                    : "bg-bg-elevated text-text-secondary border-border-strong hover:bg-border-subtle"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary mb-3 block">Threat Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isActive = filters.category?.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    isActive
                    ? "bg-accent-cyan text-black border-accent-cyan"
                    : "bg-bg-elevated text-text-secondary border-border-strong hover:bg-border-subtle"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-end pb-1 md:pb-0.5 mt-2 md:mt-0">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              filters.truePositive ? "bg-accent-cyan border-accent-cyan" : "bg-bg-elevated border-border-strong group-hover:border-accent-cyan"
            }`}>
              {filters.truePositive && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm font-medium text-text-primary select-none">True Positives Only</span>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={filters.truePositive || false}
              onChange={(e) => setFilters({ truePositive: e.target.checked || null })}
            />
          </label>
        </div>

      </div>
    </div>
  );
}
