"use client";

import useSWR from "swr";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { formatTimestamp } from "@/lib/utils";
import { LogEntry } from "@/types/log";
import { PaginatedResponse } from "@/types/api";
import { useState } from "react";
import { LogDetailSheet } from "./LogDetailSheet";
import { Eye } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function LogsTable() {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    ip: parseAsString.withDefault(""),
    method: parseAsString.withDefault("ALL"),
    analyzed: parseAsString.withDefault("All"),
    page: parseAsInteger.withDefault(1),
  });

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.ip) queryParams.set("ip", filters.ip);
  if (filters.method && filters.method !== "ALL") queryParams.set("method", filters.method);
  if (filters.analyzed && filters.analyzed !== "All") queryParams.set("analyzed", filters.analyzed);
  queryParams.set("page", filters.page.toString());
  queryParams.set("pageSize", "50");

  const { data, isLoading } = useSWR<PaginatedResponse<LogEntry>>(`/api/logs?${queryParams.toString()}`, fetcher, { revalidateOnFocus: false });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-10 bg-bg-elevated animate-pulse rounded-md" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-12 bg-bg-surface border border-border-subtle animate-pulse rounded-md" />
      ))}
    </div>;
  }

  if (!data || !data.data || data.data.length === 0) {
    return <div className="py-24 flex flex-col items-center text-center text-text-secondary bg-bg-surface border border-border-subtle rounded-md">
      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
        <Eye className="w-5 h-5 text-text-tertiary" />
      </div>
      <h3 className="font-semibold text-text-primary">No logs found</h3>
      <p className="text-sm max-w-sm mt-1">Try adjusting your filters to find what you&apos;re looking for.</p>
      <button onClick={() => setFilters({ search: "", ip: "", method: "ALL", analyzed: "All", page: 1 })} className="mt-4 px-4 py-2 bg-bg-elevated text-sm font-medium rounded-md hover:bg-border-subtle transition-colors">
        Clear all filters
      </button>
    </div>;
  }

  return (
    <>
      <div className="bg-bg-surface border border-border-subtle rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border-strong bg-bg-elevated/50 text-[11px] uppercase tracking-wider text-text-secondary font-semibold">
                <th className="px-5 py-3 w-[160px]">Timestamp</th>
                <th className="px-5 py-3 w-[140px]">Source IP</th>
                <th className="px-5 py-3 w-[100px]">Method</th>
                <th className="px-5 py-3 min-w-[200px]">URL</th>
                <th className="px-5 py-3 min-w-[200px]">User Agent</th>
                <th className="px-5 py-3 w-[100px] text-center">Analyzed</th>
                <th className="px-5 py-3 w-[80px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.data.map((log) => (
                <tr key={log._id} className="hover:bg-bg-elevated transition-colors group">
                  <td className="px-5 py-2.5 font-mono text-[13px] text-text-tertiary">
                    {formatTimestamp(log.received_at)}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[13px] text-accent-cyan">
                    {log.source_ip}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-bg-elevated border border-border-subtle">
                      {log.method || "N/A"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-text-secondary truncate max-w-[250px]" title={log.url}>
                    {log.url && log.url.length > 60 ? log.url.substring(0, 60) + "..." : log.url || "N/A"}
                  </td>
                  <td className="px-5 py-2.5 text-text-tertiary truncate max-w-[250px]" title={log.user_agent}>
                    {log.user_agent && log.user_agent.length > 40 ? log.user_agent.substring(0, 40) + "..." : log.user_agent || "N/A"}
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    {log.analyzed ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-risk-low shadow-[0_0_8px_var(--color-risk-low)]" title="Analyzed" />
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-text-tertiary" title="Pending" />
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold uppercase tracking-wider"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border-subtle flex justify-between items-center text-xs font-mono text-text-secondary bg-bg-surface shrink-0 mt-auto">
          <span>Showing {((data.page - 1) * data.pageSize) + 1} &mdash; {Math.min(data.page * data.pageSize, data.total)} of {data.total} records</span>
          <div className="flex gap-2">
            <button 
              disabled={data.page <= 1} 
              onClick={() => setFilters({ page: data.page - 1 })}
              className="px-4 py-1.5 bg-bg-elevated border border-border-subtle rounded focus:outline-none hover:bg-border-subtle disabled:opacity-30 transition-colors uppercase tracking-wider"
            >
              Prev
            </button>
            <button 
              disabled={data.page * data.pageSize >= data.total}
              onClick={() => setFilters({ page: data.page + 1 })}
              className="px-4 py-1.5 bg-bg-elevated border border-border-subtle rounded focus:outline-none hover:bg-border-subtle disabled:opacity-30 transition-colors uppercase tracking-wider"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {selectedLog && (
        <LogDetailSheet log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  );
}
