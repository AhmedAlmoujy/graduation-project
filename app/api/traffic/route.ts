import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

const querySchema = z.object({
  srcIp: z.string().optional(),
  dstIp: z.string().optional(),
  port: z.coerce.number().optional(),
  protocol: z.string().optional(),
  label: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(100),
  sort: z.string().default("timestamp"),
  order: z.enum(["asc", "desc"]).default("desc")
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()));
    
    const db = await getDb();
    const query: any = {};

    if (parsed.srcIp) query.src_ip = { $regex: parsed.srcIp, $options: "i" };
    if (parsed.dstIp) query.dst_ip = { $regex: parsed.dstIp, $options: "i" };
    if (parsed.port) {
      query.$or = [{ src_port: parsed.port }, { dst_port: parsed.port }];
    }
    if (parsed.protocol && parsed.protocol !== "ALL") {
      const protoMap: Record<string, number> = { "TCP": 6, "UDP": 17, "ICMP": 1 };
      query.protocol = protoMap[parsed.protocol] || Number(parsed.protocol) || parsed.protocol;
    }
    if (parsed.label && parsed.label !== "ALL") {
      query.label = parsed.label === "ATTACK" ? 1 : 0;
    }
    
    if (parsed.from || parsed.to) {
      query.timestamp = {};
      if (parsed.from) query.timestamp.$gte = new Date(parsed.from);
      if (parsed.to) query.timestamp.$lte = new Date(parsed.to);
    }

    const skip = (parsed.page - 1) * parsed.pageSize;
    const sortObj: any = { [parsed.sort]: parsed.order === "desc" ? -1 : 1 };

    const [data, total] = await Promise.all([
      db.collection("traffic_logs").find(query).sort(sortObj).skip(skip).limit(parsed.pageSize).toArray(),
      db.collection("traffic_logs").countDocuments(query)
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
