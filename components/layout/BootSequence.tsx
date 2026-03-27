"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BOOT_STEPS = [
  { text: "INITIALIZING CRUCIX ENGINE v2.1.0", delay: 800 },
  { text: "CONNECTING 26 OSINT SOURCES...", delay: 1800 },
  { text: "├─ OPENSKY · FIRMS · KIWISDR · MARITIME", delay: 2400 },
  { text: "├─ FRED · BLS · EIA · TREASURY · GSCPI", delay: 2800 },
  { text: "├─ TELEGRAM · SAFECAST · EPA · WHO · OFAC", delay: 3200 },
  { text: "└─ GDELT · NOAA · PATENTS · BLUESKY · REDDIT", delay: 3600 },
];

export function BootSequence() {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(true);

  useEffect(() => {
    // Check if we've already booted in this session to avoid annoyance
    const hasBooted = sessionStorage.getItem("crucix_booted");
    if (hasBooted) {
      setIsComplete(true);
      setShouldRender(false);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    BOOT_STEPS.forEach((step, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleSteps(index + 1);
        }, step.delay)
      );
    });

    // Finish boot sequence
    const finishTimer = setTimeout(() => {
      setIsComplete(true);
      sessionStorage.setItem("crucix_booted", "true");
      // Give time for fade out animation
      setTimeout(() => setShouldRender(false), 500); 
    }, 4500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-9999 bg-[#030406] flex flex-col items-center justify-center transition-opacity duration-500 font-mono",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center max-w-2xl w-full px-8">
        
        {/* Logo Section */}
        <div className="relative mb-16 flex items-center justify-center animate-pulse-slow">
          <div className="absolute w-[180px] h-[180px] rounded-full border border-accent-cyan/10 blur-[2px]"></div>
          <div className="absolute w-[160px] h-[160px] rounded-full border border-accent-cyan/20"></div>
          <div className="absolute w-[140px] h-[140px] rounded-full border-2 border-accent-cyan/40 shadow-[0_0_30px_rgba(0,255,255,0.15)_inset]"></div>
          
          <h1 className="text-accent-cyan font-bold tracking-[0.2em] text-2xl z-10 shadow-accent-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
            CRUCIX
          </h1>
        </div>

        {/* Console output section */}
        <div className="w-full max-w-[420px] mx-auto flex flex-col gap-2 text-[13px] text-text-secondary/70 h-[180px]">
          {BOOT_STEPS.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "transition-opacity duration-150 flex items-start",
                index < visibleSteps ? "opacity-100" : "opacity-0"
              )}
            >
              {index < visibleSteps && (
                <span className="typing-text tracking-widest leading-relaxed">
                  {step.text}
                </span>
              )}
            </div>
          ))}
          {/* Blinking cursor */}
          {!isComplete && visibleSteps > 0 && (
            <div className="w-2 h-[1em] bg-accent-cyan/70 animate-pulse mt-1 ml-1" />
          )}
        </div>
      </div>
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
