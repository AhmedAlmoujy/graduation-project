"use client";

import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const start = Date.now();
        const res = await fetch("/api/health");
        if (res.ok) {
          if (mounted) {
            setStatus("connected");
            setLatency(Date.now() - start);
          }
        } else {
          if (mounted) setStatus("disconnected");
        }
      } catch {
        if (mounted) setStatus("disconnected");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 text-xs text-text-secondary border-t border-border-subtle bg-bg-surface mt-auto">
      <div className="relative flex h-3 w-3 items-center justify-center shrink-0">
        {status === "connected" ? (
          <>
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
          </>
        ) : status === "connecting" ? (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-medium"></span>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-critical"></span>
        )}
      </div>
      <div className="flex justify-between w-full">
        <span>{status === "connected" ? "MongoDB Live" : status === "disconnected" ? "Disconnected" : "Connecting..."}</span>
        {status === "connected" && latency !== null && (
          <span className="text-text-tertiary">{latency}ms</span>
        )}
      </div>
    </div>
  );
}
