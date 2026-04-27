import { NextRequest, NextResponse } from "next/server";
import { isMutationAuthorized } from "@/lib/auth";
import { insertObservationDate, listObservationDates } from "@/lib/db";
import { normalizeDateInput } from "@/lib/utils";

export async function GET() {
  const dates = await listObservationDates();
  return NextResponse.json({ dates });
}

export async function POST(request: NextRequest) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const date = normalizeDateInput(typeof body?.date === "string" ? body.date : "");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const observationDate = await insertObservationDate(date);
  return NextResponse.json({ observationDate }, { status: 201 });
}
