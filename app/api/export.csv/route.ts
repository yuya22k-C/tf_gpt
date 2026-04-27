import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/csv";
import { listObservationDates, listPlants, listRecords } from "@/lib/db";

export async function GET() {
  const [plants, dates, records] = await Promise.all([
    listPlants(),
    listObservationDates(),
    listRecords(),
  ]);
  const csv = buildCsv(plants, dates, records);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tomato-tracker.csv"',
    },
  });
}
