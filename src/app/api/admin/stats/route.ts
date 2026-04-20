export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MenuItem, Reservation, Deal, Testimonial } from "@/models";
import { getAdminSession } from "@/lib/adminSession";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const [menuCount, resCount, dealCount, testCount, recentReservations] =
      await Promise.all([
        MenuItem.countDocuments(),
        Reservation.countDocuments(),
        Deal.countDocuments(),
        Testimonial.countDocuments(),
        Reservation.find().sort({ createdAt: -1 }).limit(5),
      ]);

    // Calculate "Revenue" (sum of all paid or pending reservation advance amounts)
    const reservations = await Reservation.find({});
    const totalRevenue = reservations.reduce(
      (acc, curr) => acc + curr.totalAmount,
      0,
    );

    return NextResponse.json({
      counts: {
        menu: menuCount,
        reservations: resCount,
        deals: dealCount,
        testimonials: testCount,
      },
      revenue: totalRevenue,
      recentReservations,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stats error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

