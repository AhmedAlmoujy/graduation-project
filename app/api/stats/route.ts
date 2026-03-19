import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { subDays, subHours } from "date-fns";

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();
    const last24h = subHours(now, 24);
    const last48h = subHours(now, 48);

    const [
      totalThreatsCount, totalThreatsPrevious,
      activeIpsCurrent, activeIpsPrevious,
      avgRiskCurrent, avgRiskPrevious,
      criticalCurrent, criticalPrevious,
      topAttackers,
      protocolDist,
      recentThreats
    ] = await Promise.all([
      db.collection("reports").countDocuments({ is_true_positive: true, created_at: { $gte: last24h } }),
      db.collection("reports").countDocuments({ is_true_positive: true, created_at: { $gte: last48h, $lt: last24h } }),
      
      db.collection("traffic_logs").distinct("src_ip", { timestamp: { $gte: last24h } }),
      db.collection("traffic_logs").distinct("src_ip", { timestamp: { $gte: last48h, $lt: last24h } }),
      
      db.collection("reports").aggregate([
        { $match: { created_at: { $gte: last24h } } },
        { $group: { _id: null, avg: { $avg: "$risk_score" } } }
      ]).toArray(),
      db.collection("reports").aggregate([
        { $match: { created_at: { $gte: last48h, $lt: last24h } } },
        { $group: { _id: null, avg: { $avg: "$risk_score" } } }
      ]).toArray(),
      
      db.collection("reports").countDocuments({ risk_score: { $gte: 8 }, created_at: { $gte: last24h } }),
      db.collection("reports").countDocuments({ risk_score: { $gte: 8 }, created_at: { $gte: last48h, $lt: last24h } }),
      
      db.collection("traffic_logs").aggregate([
        { $match: { label: { $in: [1, "ATTACK", "1"] } } },
        { $group: { _id: "$src_ip", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { ip: "$_id", count: 1, _id: 0 } }
      ]).toArray(),
      
      db.collection("traffic_logs").aggregate([
        { $group: { _id: "$protocol", count: { $sum: 1 } } },
        { $project: { protocol: "$_id", count: 1, _id: 0 } }
      ]).toArray(),
      
      db.collection("reports")
        .find({ risk_score: { $gte: 6 } })
        .sort({ created_at: -1 })
        .limit(5)
        .toArray()
    ]);

    const last7d = subDays(now, 7);
    const timelineRaw = await db.collection("traffic_logs").aggregate([
      { $match: { timestamp: { $gte: last7d } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          attack: { $sum: { $cond: [{ $in: ["$label", [1, "ATTACK", "1"]] }, 1, 0] } },
          benign: { $sum: { $cond: [{ $in: ["$label", [0, "BENIGN", "0"]] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const trafficTimeline = timelineRaw.map(t => ({
      date: t._id,
      attack: t.attack,
      benign: t.benign
    }));

    return NextResponse.json({
      kpi: {
        totalThreats: totalThreatsCount,
        activeSourceIps: activeIpsCurrent.length,
        avgRiskScore: avgRiskCurrent[0]?.avg || 0,
        criticalAlerts: criticalCurrent,
        delta: {
          totalThreats: totalThreatsCount - totalThreatsPrevious,
          activeSourceIps: activeIpsCurrent.length - activeIpsPrevious.length,
          avgRiskScore: (avgRiskCurrent[0]?.avg || 0) - (avgRiskPrevious[0]?.avg || 0),
          criticalAlerts: criticalCurrent - criticalPrevious
        }
      },
      topAttackers,
      protocolDist,
      trafficTimeline,
      recentThreats
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
