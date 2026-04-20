import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Reservation, ReservationOffer } from "@/models";
import crypto from "crypto";
import { getAdminSession } from "@/lib/adminSession";
import { toSlotKey } from "@/lib/reservationSlot";
import { asValidationMessage, reservationCreateSchema } from "@/lib/validation";
import { computeReservationAdvanceAmount } from "@/lib/paymentIntegrity";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = reservationCreateSchema.parse(await request.json());

    const userName = body.userName;
    const email = body.email.trim().toLowerCase();
    const phone = body.phone;
    const time = body.time;
    const specialRequest = body.specialRequest?.trim() || "";
    const offerId = body.offerId ? String(body.offerId) : "";
    const seats = body.seats;
    const date = body.date;

    const slotMinutes = Number(process.env.RESERVATION_SLOT_MINUTES || 60);
    const slotKey = toSlotKey({
      date,
      time,
      slotMinutes: Number.isFinite(slotMinutes) ? slotMinutes : 60,
    });

    const maxSeatsRaw = Number(
      process.env.RESERVATION_MAX_SEATS_PER_SLOT || 20,
    );
    const maxSeats = Number.isFinite(maxSeatsRaw)
      ? Math.max(1, Math.floor(maxSeatsRaw))
      : 20;

    if (slotKey) {
      const agg = await Reservation.aggregate([
        {
          $match: {
            slotKey,
            status: { $ne: "cancelled" },
            paymentStatus: { $in: ["pending", "paid"] },
          },
        },
        { $group: { _id: null, totalSeats: { $sum: "$seats" } } },
      ]);

      const existingSeats = Number(agg?.[0]?.totalSeats || 0);
      if (existingSeats + seats > maxSeats) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This time slot is fully booked. Please choose another slot.",
          },
          { status: 409 },
        );
      }
    }

    let computedTotalAmount = 0;
    let normalizedOfferId: string | undefined = undefined;

    if (offerId) {
      const offer = await ReservationOffer.findById(offerId).lean();
      if (!offer) {
        return NextResponse.json(
          { success: false, error: "Invalid reservation offer" },
          { status: 400 },
        );
      }

      computedTotalAmount = computeReservationAdvanceAmount({
        seats,
        advanceAmountPerPerson: Number(offer.advanceAmountPerPerson || 0),
      });
      normalizedOfferId = String(offer._id);
    }

    // Generate a unique booking ID
    const bookingId = `MM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const reservation = await Reservation.create({
      userName,
      email,
      phone,
      seats,
      date,
      time,
      slotKey: slotKey || undefined,
      status: "confirmed",
      specialRequest: specialRequest || undefined,
      offerId: normalizedOfferId || undefined,
      totalAmount: computedTotalAmount,
      bookingId,
      paymentStatus: "pending", // Initially pending
    });

    return NextResponse.json(
      {
        success: true,
        data: reservation,
        message: "Reservation created successfully",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      asValidationMessage(error) ||
      (error instanceof Error ? error.message : "Reservation error");
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    return NextResponse.json(reservations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

