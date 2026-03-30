import { NextRequest, NextResponse } from "next/server";
import { queryReportsByDomain, queryLatestReports } from "@/lib/dynamodb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const domain = searchParams.get("domain");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  try {
    if (domain) {
      const reports = await queryReportsByDomain(domain);
      return NextResponse.json({ reports });
    }

    if (type) {
      const reports = await queryLatestReports(type, limit);
      return NextResponse.json({ reports });
    }

    return NextResponse.json(
      { error: "domain or type parameter required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("DynamoDB query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
