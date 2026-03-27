"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldAlert, LayoutDashboard, Map as MapIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/traffic", label: "Traffic", icon: Activity },
  { href: "/reports", label: "Reports", icon: ShieldAlert },
  { href: "/map", label: "Map", icon: MapIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-full bg-bg-surface border-r border-border-subtle">
      <div className="h-14 flex items-center px-6 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_var(--color-accent-cyan)]" />
          <span className="font-mono font-semibold tracking-wider text-sm text-text-primary">
            SOC INTEL
          </span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-accent-cyan-dim text-text-primary pl-2 border-l-2 border-accent-cyan" 
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary ml-[2px]"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ConnectionStatus />
    </aside>
  );
}
