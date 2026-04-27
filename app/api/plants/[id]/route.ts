import { NextRequest, NextResponse } from "next/server";
import { isMutationAuthorized } from "@/lib/auth";
import { removePlant, renamePlant } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Plant name is required" }, { status: 400 });
  }

  const plant = await renamePlant(id, name);
  if (!plant) {
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  }

  return NextResponse.json({ plant });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await removePlant(id);
  return new NextResponse(null, { status: 204 });
}
