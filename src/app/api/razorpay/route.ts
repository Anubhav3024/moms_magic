import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import { Reservation } from "@/models";
import {
  asValidationMessage,
  razorpayOrderCreateSchema,
} from "@/lib/validation";
import {
  expectedReservationAmountMinorUnits,
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
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment is not configured on the server" },
        { status: 503 },
      );
    }

    const body = razorpayOrderCreateSchema.parse(await request.json());
    const reservationId = body.reservationId;
    const currency = normalizeCurrency(body.currency || "INR");

    await dbConnect();
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (reservation.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Reservation already paid" },
        { status: 409 },
      );
    }

    const expectedAmount = expectedReservationAmountMinorUnits(
      Number(reservation.totalAmount || 0),
    );

    if (expectedAmount <= 0) {
      return NextResponse.json(
        { error: "Reservation amount must be greater than zero" },
        { status: 400 },
      );
    }

    const options = {
      amount: expectedAmount,
      currency,
      receipt: `reservation_${reservation.bookingId || Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Reservation.findByIdAndUpdate(
      reservationId,
      {
        $set: {
          paymentProvider: "razorpay",
          paymentStatus: "pending",
          razorpayOrderId: order.id,
          razorpayExpectedAmount: expectedAmount,
          razorpayCurrency: currency,
        },
      },
      { new: false },
    );

    return NextResponse.json({
      order,
      keyId: keyId || "",
    });
  } catch (error: unknown) {
    const validationMessage = asValidationMessage(error);
    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Payment error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
