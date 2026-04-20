export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Reservation } from "@/models";
import {
  expectedReservationAmountMinorUnits,
  hasExactAmountAndCurrencyMatch,
  normalizeCurrency,
} from "@/lib/paymentIntegrity";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  const a = Buffer.from(String(aHex || ""), "hex");
  const b = Buffer.from(String(bHex || ""), "hex");
  if (!a.length || !b.length) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const secret = String(process.env.RAZORPAY_WEBHOOK_SECRET || "");
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook is not configured" },
        { status: 503 },
      );
    }

    const signature = String(request.headers.get("x-razorpay-signature") || "");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const raw = await request.text();
    const expected = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");

    if (!timingSafeEqualHex(expected, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const root = asRecord(payload);
    if (!root) {
      return NextResponse.json({ ok: true });
    }

    const event = String(root.event || "");

    // Handle payment capture / failure updates.
    const payloadObj = asRecord(root.payload);
    const paymentObj = payloadObj ? asRecord(payloadObj.payment) : null;
    const entityObj = paymentObj ? asRecord(paymentObj.entity) : null;

    const orderId = String(entityObj?.order_id || "");
    const paymentId = String(entityObj?.id || "");
    const status = String(entityObj?.status || "");
    const amount = Number(entityObj?.amount || 0);
    const currency = String(entityObj?.currency || "INR");

    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    await dbConnect();
    const reservation = await Reservation.findOne({ razorpayOrderId: orderId });
    if (!reservation) {
      return NextResponse.json({ ok: true });
    }

    const expectedAmount = Number.isFinite(
      Number(reservation.razorpayExpectedAmount),
    )
      ? Number(reservation.razorpayExpectedAmount)
      : expectedReservationAmountMinorUnits(
          Number(reservation.totalAmount || 0),
        );
    const expectedCurrency = normalizeCurrency(
      String(reservation.razorpayCurrency || currency || "INR"),
    );

    const matches = hasExactAmountAndCurrencyMatch({
      expectedAmount,
      expectedCurrency,
      actualAmount: amount,
      actualCurrency: currency,
    });

    if (!matches) {
      return NextResponse.json(
        { error: "Order amount or currency mismatch" },
        { status: 400 },
      );
    }

    if (event === "payment.captured" || status === "captured") {
      if (reservation.paymentStatus !== "paid") {
        reservation.paymentStatus = "paid";
      }
      reservation.paymentProvider = "razorpay";
      reservation.razorpayOrderId = orderId;
      reservation.razorpayExpectedAmount = expectedAmount;
      reservation.razorpayCurrency = expectedCurrency;
      if (paymentId) reservation.razorpayPaymentId = paymentId;
      await reservation.save();
    }

    if (event === "payment.failed" || status === "failed") {
      reservation.paymentStatus = "failed";
      reservation.paymentProvider = "razorpay";
      reservation.razorpayOrderId = orderId;
      reservation.razorpayExpectedAmount = expectedAmount;
      reservation.razorpayCurrency = expectedCurrency;
      if (paymentId) reservation.razorpayPaymentId = paymentId;
      await reservation.save();
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
