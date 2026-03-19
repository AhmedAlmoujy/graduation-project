"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const ThreatMap = dynamic(() => import("@/components/map/ThreatMap").then(mod => mod.ThreatMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-bg-base flex-col gap-6 relative z-10">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
        <div className="absolute inset-0 border-2 border-accent-cyan rounded-full animate-ping opacity-20" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-accent-cyan font-mono text-xs tracking-[0.2em] uppercase font-semibold">Initializing Canvas Engine</div>
        <div className="text-text-tertiary font-mono text-[10px] tracking-wider">Loading Geospatial Vectors...</div>
      </div>
    </div>
  )
});

export default function MapPage() {
  return (
    <div className="w-full h-[calc(100vh-56px)] overflow-hidden relative bg-bg-base">
      <Suspense fallback={null}>
        <ThreatMap />
      </Suspense>
    </div>
  );
}
