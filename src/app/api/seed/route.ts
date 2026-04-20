import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import {
  Category,
  MenuItem,
  ReservationOffer,
  Deal,
  Testimonial,
  Story,
} from "@/models";
import { getAdminSession } from "@/lib/adminSession";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Seed endpoint is disabled in production" },
        { status: 403 },
      );
    }

    const admin = await getAdminSession();

    if (!admin || String(admin.role || "") !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Clear existing
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await ReservationOffer.deleteMany({});
    await Deal.deleteMany({});
    await Testimonial.deleteMany({});
    await Story.deleteMany({});

    // Add Categories
    const starter = await Category.create({
      name: "Starters",
      description: "Begin your magical journey",
    });
    const main = await Category.create({
      name: "Main Course",
      description: "Hearty homemade meals",
    });
    const dessert = await Category.create({
      name: "Desserts",
      description: "Sweet endings",
    });
    const beverages = await Category.create({
      name: "Beverages",
      description: "Refreshing drinks",
    });

    // Add Menu Items
    await MenuItem.create([
      {
        name: "Magic Paneer Tikka",
        description:
          "Grilled cottage cheese marinated in secret spices and slow-cooked in a tandoor.",
        price: 250,
        imageUrl:
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800",
        categoryId: starter._id,
        isVeg: true,
      },
      {
        name: "Butter Chicken Bliss",
        description:
          "Slow-cooked creamy chicken in a rich, buttery tomato gravy with aromatic spices.",
        price: 450,
        imageUrl:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800",
        categoryId: main._id,
        isVeg: false,
      },
      {
        name: "Gulab Jamun Gold",
        description:
          "Soft, golden-fried dumplings soaked in saffron-infused sugar syrup.",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800",
        categoryId: dessert._id,
        isVeg: true,
      },
      {
        name: "Masala Chai Magic",
        description:
          "Authentic Indian spiced tea with ginger, cardamom, and a hint of magic.",
        price: 80,
        imageUrl:
          "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=800",
        categoryId: beverages._id,
        isVeg: true,
      },
    ]);

    // Add Reservation Offers
    await ReservationOffer.create([
      {
        title: "Standard Booking",
        description: "INR 50 per person -> Get 10% off total bill",
        advanceAmountPerPerson: 50,
        discountPercent: 10,
      },
      {
        title: "Priority Seating",
        description: "INR 100 per person -> Priority seating + 15% off",
        advanceAmountPerPerson: 100,
        discountPercent: 15,
      },
      {
        title: "No Advance",
        description: "Standard booking, no discount",
        advanceAmountPerPerson: 0,
        discountPercent: 0,
      },
    ]);

    // Add Deals
    await Deal.create([
      {
        title: "Weekend Family Feast",
        description:
          "Get 20% off on all main course items every Saturday and Sunday.",
        discountType: "percentage",
        discountValue: 20,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        imageUrl:
          "https://images.unsplash.com/photo-1547928576-a4a33237eceb?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
      {
        title: "First Order Magic",
        description: "Special welcome discount for our new magical members.",
        discountType: "fixed",
        discountValue: 150,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        imageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
    ]);

    // Add Testimonials
    await Testimonial.create([
      {
        customerName: "Anubhav Singh",
        rating: 5,
        comment:
          "The taste is exactly like what my mom used to make. The warmth and elegance of this place are unmatched.",
        imageUrl: "https://i.pravatar.cc/150?u=a",
      },
      {
        customerName: "Riya Sharma",
        rating: 5,
        comment:
          "A magical experience indeed! The Butter Chicken is a must-try. Highly recommended for family dinners.",
        imageUrl: "https://i.pravatar.cc/150?u=b",
      },
    ]);

    // Add Story
    await Story.create({
      title: "Our Story",
      description:
        "Founded on the belief that the best meals are those that bring people together, Mom's Magic started in a small home kitchen. Our founder, inspired by her mother's legendary recipes, wanted to share that same warmth with the world. Every spice is hand-picked, every dish is slow-cooked, and every experience is crafted to make you feel at home. We don't just serve food; we serve memories.",
      quote: "Where tradition meets elegance, and taste meets magic.",
      images: [
        "/logo.png",
        "https://images.unsplash.com/photo-1550966844-4919584d993c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
      ],
    });

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error: unknown) {
    console.error("Seeding error:", error);
    const message = error instanceof Error ? error.message : "Seed error";
    return NextResponse.json(
      {
        message: "Seeding failed magic!",
        error: message,
      },
      { status: 500 },
    );
  }
}

