import { NextRequest, NextResponse } from "next/server";
import { isMutationAuthorized } from "@/lib/auth";
import { removeObservationDate } from "@/lib/db";

type RouteContext = {
  params: Promise<{ date: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = await context.params;
  await removeObservationDate(date);
  return new NextResponse(null, { status: 204 });
}
