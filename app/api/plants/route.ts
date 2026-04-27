import { NextRequest, NextResponse } from "next/server";
import { isMutationAuthorized } from "@/lib/auth";
import { createId } from "@/lib/utils";
import { insertPlant, listPlants } from "@/lib/db";

export async function GET() {
  const plants = await listPlants();
  return NextResponse.json({ plants });
}

export async function POST(request: NextRequest) {
  if (!isMutationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Plant name is required" }, { status: 400 });
  }

  const plant = await insertPlant(createId("plant"), name);
  return NextResponse.json({ plant }, { status: 201 });
}
