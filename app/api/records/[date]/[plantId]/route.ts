import { NextRequest, NextResponse } from "next/server";
import { isMutationAuthorized } from "@/lib/auth";
import { removeRecord, upsertRecord } from "@/lib/db";

type RouteContext = {
  params: Promise<{ date: string; plantId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, plantId } = await context.params;
  const body = await request.json();

  const record = await upsertRecord({
    date,
    plantId,
    flowerCount: typeof body?.flowerCount === "number" ? body.flowerCount : null,
    fruitCount: typeof body?.fruitCount === "number" ? body.fruitCount : null,
    flowered: typeof body?.flowered === "boolean" ? body.flowered : null,
    harvestStarted: typeof body?.harvestStarted === "boolean" ? body.harvestStarted : null,
    harvestEnded: typeof body?.harvestEnded === "boolean" ? body.harvestEnded : null,
  });

  return NextResponse.json({ record });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, plantId } = await context.params;
  await removeRecord(date, plantId);
  return new NextResponse(null, { status: 204 });
}
