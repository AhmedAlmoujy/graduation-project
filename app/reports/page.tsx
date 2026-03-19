import { PageHeader } from "@/components/layout/PageHeader";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportCard } from "@/components/reports/ReportCard";
import { getDb } from "@/lib/mongodb";
import { ThreatReport } from "@/types/report";
import { ShieldCheck } from "lucide-react";

async function getReports(searchParams: { [key: string]: string | string[] | undefined }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const query = new URLSearchParams();
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key]) query.append(key, String(searchParams[key]));
  });
  
  try {
    const res = await fetch(`${url}/api/reports?${query.toString()}`, { cache: "no-store", headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  } catch (error) {
    return { data: [], total: 0, page: 1, pageSize: 50 };
  }
}

async function getCategories() {
  try {
    const db = await getDb();
    const categories = await db.collection("reports").distinct("threat_category");
    if (categories && categories.length > 0) return categories;
    return ["Bot", "Scanner", "Attacker", "Human", "Suspicious"];
  } catch {
    return ["Bot", "Scanner", "Attacker", "Human", "Suspicious"];
  }
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const reportsData = await getReports(params);
  const categories = await getCategories();

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <PageHeader 
        title="Threat Analysis Reports" 
        description="Comprehensive security reports powered by AI correlation of network and application logs."
      />
      
      <ReportsFilters categories={categories} />
      
      {reportsData.data.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-bg-surface border border-border-subtle rounded-md shadow-sm">
          <div className="w-16 h-16 rounded-full bg-risk-low-dim text-risk-low flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No actionable threats found</h3>
          <p className="text-text-secondary mt-2 text-sm max-w-md">Your network is secure based on the current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportsData.data.map((report: ThreatReport) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
