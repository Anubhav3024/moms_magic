export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Admin } from "@/models";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const key = String(request.headers.get("x-bootstrap-key") || "");
    const expected = String(process.env.ADMIN_BOOTSTRAP_KEY || "");
    if (!expected || key !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const exists = await Admin.findOne({});
    if (exists) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = String(body?.name || "Magic Admin").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const admin = await Admin.create({
      name,
      email,
      role: "admin",
      profileImage: "",
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({ admin: { id: String(admin._id), email: admin.email } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bootstrap error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

