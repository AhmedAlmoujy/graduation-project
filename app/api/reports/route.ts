import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

const querySchema = z.object({
  riskLevel: z.string().optional(), // comma-separated: CRITICAL,HIGH,MEDIUM,LOW
  category: z.string().optional(), // comma-separated
  truePositive: z.enum(["true", "false"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  sort: z.string().default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc")
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()));
    
    const db = await getDb();
    const query: any = {};

    if (parsed.riskLevel) {
      const levels = parsed.riskLevel.split(",");
      const orConditions = [];
      if (levels.includes("CRITICAL")) orConditions.push({ risk_score: { $gte: 8 } });
      if (levels.includes("HIGH")) orConditions.push({ risk_score: { $gte: 6, $lt: 8 } });
      if (levels.includes("MEDIUM")) orConditions.push({ risk_score: { $gte: 4, $lt: 6 } });
      if (levels.includes("LOW")) orConditions.push({ risk_score: { $lt: 4 } });
      if (orConditions.length > 0) query.$or = orConditions;
    }

    if (parsed.category) {
      query.threat_category = { $in: parsed.category.split(",") };
    }

    if (parsed.truePositive) {
      query.is_true_positive = parsed.truePositive === "true";
    }
    
    if (parsed.from || parsed.to) {
      query.created_at = {};
      if (parsed.from) query.created_at.$gte = new Date(parsed.from);
      if (parsed.to) query.created_at.$lte = new Date(parsed.to);
    }

    const skip = (parsed.page - 1) * parsed.pageSize;
    const sortObj: any = { [parsed.sort]: parsed.order === "desc" ? -1 : 1 };

    const [data, total] = await Promise.all([
      db.collection("reports").find(query).sort(sortObj).skip(skip).limit(parsed.pageSize).toArray(),
      db.collection("reports").countDocuments(query)
    ]);

    return NextResponse.json({
      data,
      total,
      page: parsed.page,
      pageSize: parsed.pageSize
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 });
  }
}
