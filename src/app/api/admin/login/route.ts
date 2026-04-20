export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Admin } from "@/models";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/adminSession";
import { adminLoginSchema, asValidationMessage } from "@/lib/validation";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = adminLoginSchema.parse(await request.json());

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    let admin = await Admin.findOne({ email });

    // Optional first-run bootstrap using env vars (dev-friendly).
    if (!admin) {
      const bootEmail = String(process.env.ADMIN_EMAIL || "")
        .trim()
        .toLowerCase();
      const bootPass = String(process.env.ADMIN_PASSWORD || "");

      if (
        bootEmail &&
        bootPass &&
        email === bootEmail &&
        password === bootPass
      ) {
        admin = await Admin.create({
          name: "Magic Admin",
          email: bootEmail,
          role: "admin",
          profileImage: "",
          passwordHash: hashPassword(bootPass),
        });
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const hash = String(admin.passwordHash || "");
    if (!hash) {
      return NextResponse.json(
        {
          error:
            "Admin password is not set. Set ADMIN_EMAIL/ADMIN_PASSWORD for first login or use /api/admin/bootstrap.",
        },
        { status: 409 },
      );
    }

    const ok = verifyPassword(password, hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken({
      sub: String(admin._id),
      email: String(admin.email),
      role: String(admin.role || "admin"),
    });

    const res = NextResponse.json({
      admin: {
        id: String(admin._id),
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });
    res.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions());
    return res;
  } catch (error: unknown) {
    const validationMessage = asValidationMessage(error);
    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Login error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
