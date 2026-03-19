import { PageHeader } from "@/components/layout/PageHeader";
import { TrafficFilters } from "@/components/traffic/TrafficFilters";
import { TrafficTable } from "@/components/traffic/TrafficTable";

export default function TrafficPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <PageHeader 
        title="Network Traffic Monitoring" 
        description="Monitor point-to-point network connections and real-time AI classification."
      />
      <TrafficFilters />
      <TrafficTable />
    </div>
  );
}
