export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Testimonial } from "@/models";
import { getAdminSession } from "@/lib/adminSession";
import { asValidationMessage, testimonialCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({});
    return NextResponse.json(testimonials);
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
    const body = testimonialCreateSchema.parse(await request.json());
    const newTestimonial = await Testimonial.create(body);
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Create error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

