"use client";

import useSWR from "swr";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { formatTimestamp } from "@/lib/utils";
import { TrafficRecord } from "@/types/traffic";
import { PaginatedResponse } from "@/types/api";
import { useState } from "react";
import { TrafficDetailSheet } from "./TrafficDetailSheet";
import { ShieldCheck, ShieldAlert, Activity } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TrafficTable() {
  const [filters, setFilters] = useQueryStates({
    srcIp: parseAsString.withDefault(""),
    dstIp: parseAsString.withDefault(""),
    port: parseAsInteger,
    protocol: parseAsString.withDefault("ALL"),
    label: parseAsString.withDefault("ALL"),
    page: parseAsInteger.withDefault(1),
  });

  const queryParams = new URLSearchParams();
  if (filters.srcIp) queryParams.set("srcIp", filters.srcIp);
  if (filters.dstIp) queryParams.set("dstIp", filters.dstIp);
  if (filters.port) queryParams.set("port", filters.port.toString());
  if (filters.protocol && filters.protocol !== "ALL") queryParams.set("protocol", filters.protocol);
  if (filters.label && filters.label !== "ALL") queryParams.set("label", filters.label);
  queryParams.set("page", filters.page.toString());
  queryParams.set("pageSize", "100");

  const { data, isLoading } = useSWR<PaginatedResponse<TrafficRecord>>(`/api/traffic?${queryParams.toString()}`, fetcher, { revalidateOnFocus: false });
  const [selectedRecord, setSelectedRecord] = useState<TrafficRecord | null>(null);

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-10 bg-bg-elevated animate-pulse rounded-md" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-10 bg-bg-surface border border-border-subtle animate-pulse rounded-md" />
      ))}
    </div>;
  }

  if (!data || !data.data || data.data.length === 0) {
    return <div className="py-24 flex flex-col items-center text-center text-text-secondary bg-bg-surface border border-border-subtle rounded-md">
      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
        <Activity className="w-5 h-5 text-text-tertiary" />
      </div>
      <h3 className="font-semibold text-text-primary">No traffic records found</h3>
    </div>;
  }

  const getProtocolName = (p: number) => {
    if (p === 6) return "TCP";
    if (p === 17) return "UDP";
    if (p === 1) return "ICMP";
    return `Proto ${p}`;
  };

  const isAttack = (label: number | string) => label === 1 || String(label) === "1" || label === "ATTACK";

  return (
    <>
      <div className="bg-bg-surface border border-border-subtle rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border-strong bg-bg-elevated/50 text-[11px] uppercase tracking-wider text-text-secondary font-semibold">
                <th className="px-5 py-3 w-[160px]">Timestamp</th>
                <th className="px-5 py-3 w-[140px]">Source IP</th>
                <th className="px-5 py-3 w-[80px]">Src Port</th>
                <th className="px-5 py-3 w-[140px]">Dest IP</th>
                <th className="px-5 py-3 w-[80px]">Dest Port</th>
                <th className="px-5 py-3 w-[100px]">Protocol</th>
                <th className="px-5 py-3 w-[120px]">Analysis</th>
                <th className="px-5 py-3 w-[80px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.data.map((record) => {
                const threat = isAttack(record.label);
                return (
                  <tr key={record._id} className="hover:bg-bg-elevated transition-colors group">
                    <td className="px-5 py-2.5 font-mono text-[13px] text-text-tertiary">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[13px] text-text-primary">
                      {record.src_ip}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[13px] text-text-secondary">
                      {record.src_port}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[13px] text-accent-cyan">
                      {record.dst_ip}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[13px] text-text-secondary">
                      {record.dst_port}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-bg-elevated border border-border-subtle text-text-secondary">
                        {getProtocolName(record.protocol)}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      {threat ? (
                        <div className="flex items-center gap-1.5 text-risk-critical font-semibold text-[11px] tracking-wider bg-risk-critical-dim border border-risk-critical/20 px-2 py-0.5 rounded-sm w-fit uppercase">
                          <ShieldAlert className="w-3 h-3" /> ATTACK
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-risk-low font-semibold text-[11px] tracking-wider bg-risk-low-dim border border-risk-low/20 px-2 py-0.5 rounded-sm w-fit uppercase">
                          <ShieldCheck className="w-3 h-3" /> BENIGN
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-text-tertiary hover:text-accent-cyan transition-colors text-[11px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
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
      
      {selectedRecord && (
        <TrafficDetailSheet record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </>
  );
}
