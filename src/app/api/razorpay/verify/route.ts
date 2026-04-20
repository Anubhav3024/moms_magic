export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import { Reservation } from "@/models";
import { asValidationMessage, razorpayVerifySchema } from "@/lib/validation";
import {
  expectedReservationAmountMinorUnits,
  hasExactAmountAndCurrencyMatch,
  normalizeCurrency,
} from "@/lib/paymentIntegrity";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

export async function POST(request: Request) {
  try {
    if (!razorpay || !keySecret) {
      return NextResponse.json(
        { error: "Payment verification is not configured" },
        { status: 503 },
      );
    }

    const body = razorpayVerifySchema.parse(await request.json());
    const reservationId = body.reservationId;
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    await dbConnect();
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (
      !reservation.razorpayOrderId ||
      String(reservation.razorpayOrderId) !== orderId
    ) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const order = await razorpay.orders.fetch(orderId);
    const expectedAmount = Number.isFinite(
      Number(reservation.razorpayExpectedAmount),
    )
      ? Number(reservation.razorpayExpectedAmount)
      : expectedReservationAmountMinorUnits(
          Number(reservation.totalAmount || 0),
        );
    const expectedCurrency = normalizeCurrency(
      String(reservation.razorpayCurrency || order.currency || "INR"),
    );

    const matches = hasExactAmountAndCurrencyMatch({
      expectedAmount,
      expectedCurrency,
      actualAmount: Number(order.amount || 0),
      actualCurrency: String(order.currency || "INR"),
    });

    if (!matches) {
      return NextResponse.json(
        { error: "Order amount or currency mismatch" },
        { status: 400 },
      );
    }

    reservation.paymentStatus = "paid";
    reservation.paymentProvider = "razorpay";
    reservation.razorpayOrderId = orderId;
    reservation.razorpayExpectedAmount = expectedAmount;
    reservation.razorpayCurrency = expectedCurrency;
    reservation.razorpayPaymentId = paymentId;
    reservation.razorpaySignature = signature;
    await reservation.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const validationMessage = asValidationMessage(error);
    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Verify error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
