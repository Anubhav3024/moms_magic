import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ReservationOffer } from "@/models";
import { getAdminSession } from "@/lib/adminSession";

export async function GET() {
  try {
    await dbConnect();
    const offers = await ReservationOffer.find({});
    return NextResponse.json(offers);
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
    const newOffer = await ReservationOffer.create(body);
    return NextResponse.json(newOffer, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
