import { NextRequest, NextResponse } from "next/server";
import { listRecords } from "@/lib/db";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") ?? undefined;
  const to = request.nextUrl.searchParams.get("to") ?? undefined;
  const records = await listRecords(from, to);
  return NextResponse.json({ records });
}
