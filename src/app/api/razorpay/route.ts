import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import { Reservation } from "@/models";

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
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment is not configured on the server" },
        { status: 503 },
      );
    }

    const {
      amount,
      currency = "INR",
      reservationId,
    } = (await request.json()) as {
      amount?: number;
      currency?: string;
      reservationId?: string;
    };

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const options = {
      amount: Math.round(numericAmount * 100), // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (reservationId) {
      await dbConnect();
      await Reservation.findByIdAndUpdate(
        reservationId,
        {
          $set: {
            paymentProvider: "razorpay",
            razorpayOrderId: order.id,
          },
        },
        { new: false },
      );
    }

    return NextResponse.json({
      order,
      keyId: keyId || "",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
