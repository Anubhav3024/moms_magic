export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Story } from "@/models";
import { getAdminSession } from "@/lib/adminSession";
import { asValidationMessage, storyUpsertSchema } from "@/lib/validation";

export async function GET() {
  try {
    await dbConnect();
    const story = await Story.findOne({});
    return NextResponse.json(story);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = storyUpsertSchema.parse(await request.json());
    const story = await Story.findOneAndUpdate({}, body, {
      upsert: true,
      new: true,
    });
    return NextResponse.json(story);
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Update error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

