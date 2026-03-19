import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { format } from "fast-csv";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection"); // logs, traffic, reports
    const exportFormat = searchParams.get("format") || "csv";
    
    if (!["logs", "traffic", "reports"].includes(collection || "")) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }

    const _mongodbCollectionMap: any = {
      logs: "decodeddata",
      traffic: "traffic_logs",
      reports: "reports"
    };

    const db = await getDb();
    
    const sortField = collection === "reports" ? "created_at" : collection === "traffic" ? "timestamp" : "received_at";
    
    const cursor = db.collection(_mongodbCollectionMap[collection!])
      .find({})
      .sort({ [sortField]: -1 })
      .limit(10000);

    const data = await cursor.toArray();

    if (exportFormat === "json") {
      return new NextResponse(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${collection}-export.json"`,
        },
      });
    }

    // CSV Stream
    const csvStream = format({ headers: true });
    
    const stream = new ReadableStream({
      start(controller) {
        csvStream.on("data", (chunk) => controller.enqueue(chunk));
        csvStream.on("end", () => controller.close());
        csvStream.on("error", (error) => controller.error(error));
        
        data.forEach(row => {
          const { _id, ...rest } = row;
          // Note: for decodeddata, decoded_data is a JSON string which fast-csv handles as string
          csvStream.write({ id: _id.toString(), ...rest });
        });
        csvStream.end();
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${collection}-export.csv"`,
      },
    });

  } catch (error) {
    return NextResponse.json({ error: "Export failed", details: String(error) }, { status: 500 });
  }
}
