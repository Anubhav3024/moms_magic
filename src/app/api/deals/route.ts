export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Deal } from "@/models";
import { getAdminSession } from "@/lib/adminSession";

export async function GET() {
  try {
    await dbConnect();
    const deals = await Deal.find({});
    return NextResponse.json(deals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const newDeal = await Deal.create(body);
    return NextResponse.json(newDeal, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
