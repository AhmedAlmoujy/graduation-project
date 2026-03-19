import { PageHeader } from "@/components/layout/PageHeader";
import { LogsFilters } from "@/components/logs/LogsFilters";
import { LogsTable } from "@/components/logs/LogsTable";

export default function LogsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <PageHeader 
        title="Decoded HTTP Logs Viewer" 
        description="Deep packet inspection of incoming HTTP requests processed by HAProxy."
      />
      <LogsFilters />
      <LogsTable />
    </div>
  );
}
