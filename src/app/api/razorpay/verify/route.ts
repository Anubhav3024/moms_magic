export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Reservation } from "@/models";

export async function POST(request: Request) {
  try {
    const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "");
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment verification is not configured" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      reservationId?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const reservationId = String(body?.reservationId || "").trim();
    const orderId = String(body?.razorpay_order_id || "").trim();
    const paymentId = String(body?.razorpay_payment_id || "").trim();
    const signature = String(body?.razorpay_signature || "").trim();

    if (!reservationId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 },
      );
    }

    await dbConnect();
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.razorpayOrderId && String(reservation.razorpayOrderId) !== orderId) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    reservation.paymentStatus = "paid";
    reservation.paymentProvider = "razorpay";
    reservation.razorpayOrderId = orderId;
    reservation.razorpayPaymentId = paymentId;
    reservation.razorpaySignature = signature;
    await reservation.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verify error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

