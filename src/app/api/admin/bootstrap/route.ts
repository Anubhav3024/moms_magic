export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Admin } from "@/models";
import { hashPassword } from "@/lib/password";
import { adminBootstrapSchema, asValidationMessage } from "@/lib/validation";

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
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 },
      );
    }

    const body = adminBootstrapSchema.parse(await request.json());

    const name = String(body.name || "Magic Admin").trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    const admin = await Admin.create({
      name,
      email,
      role: "admin",
      profileImage: "",
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({
      admin: { id: String(admin._id), email: admin.email },
    });
  } catch (error: unknown) {
    const validationMessage = asValidationMessage(error);
    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Bootstrap error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
