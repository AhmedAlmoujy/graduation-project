"use client";

import { Search, RefreshCw, Download } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-bg-surface border-b border-border-subtle shrink-0">
      <div className="flex items-center gap-4 text-sm font-mono text-text-primary">
        {/* Can be dynamic based on route later */}
      </div>
      
      <div className="flex-1 max-w-md mx-8 flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text"
            placeholder="Search IPs, Logs, or Reports..."
            className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-9 pr-4 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
