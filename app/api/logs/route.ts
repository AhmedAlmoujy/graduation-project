import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

const querySchema = z.object({
  ip: z.string().optional(),
  method: z.string().optional(),
  search: z.string().optional(),
  analyzed: z.enum(["All", "Analyzed", "Unanalyzed"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  sort: z.string().default("received_at"),
  order: z.enum(["asc", "desc"]).default("desc")
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()));
    
    const db = await getDb();
    const query: any = {};

    if (parsed.ip) query.source_ip = { $regex: parsed.ip, $options: "i" };
    if (parsed.method && parsed.method !== "ALL") query.method = parsed.method;
    if (parsed.analyzed) {
      if (parsed.analyzed === "Analyzed") query.analyzed = true;
      if (parsed.analyzed === "Unanalyzed") query.analyzed = false;
    }
    
    if (parsed.from || parsed.to) {
      query.received_at = {};
      if (parsed.from) query.received_at.$gte = new Date(parsed.from);
      if (parsed.to) query.received_at.$lte = new Date(parsed.to);
    }

    if (parsed.search) {
      query.$text = { $search: parsed.search };
    }

    const skip = (parsed.page - 1) * parsed.pageSize;
    const sortObj: any = { [parsed.sort]: parsed.order === "desc" ? -1 : 1 };

    const [data, total] = await Promise.all([
      db.collection("decodeddata").find(query).sort(sortObj).skip(skip).limit(parsed.pageSize).toArray(),
      db.collection("decodeddata").countDocuments(query)
    ]);

    return NextResponse.json({
      data,
      total,
      page: parsed.page,
      pageSize: parsed.pageSize
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request or server error", details: String(error) }, { status: 400 });
  }
}
