export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Admin } from "@/models";
import { getAdminSession } from "@/lib/adminSession";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const admin = await Admin.findById(session.sub).lean();
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: String(admin._id),
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage || "",
      role: admin.role,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile error";
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
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      profileImage?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (typeof body?.name === "string") updateData.name = body.name.trim();
    if (typeof body?.email === "string")
      updateData.email = body.email.trim().toLowerCase();
    if (typeof body?.profileImage === "string")
      updateData.profileImage = body.profileImage.trim();
    if (typeof body?.password === "string" && body.password.trim()) {
      updateData.passwordHash = hashPassword(body.password);
    }

    const admin = await Admin.findByIdAndUpdate(session.sub, updateData, {
      new: true,
    }).lean();

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: String(admin._id),
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage || "",
      role: admin.role,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
