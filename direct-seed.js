/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const uri = process.env.MONGODB_URI;

// Define Schemas (simplified for seeding)
const Category =
  mongoose.models.Category ||
  mongoose.model(
    "Category",
    new mongoose.Schema({ name: String, description: String }),
  );
const MenuItem =
  mongoose.models.MenuItem ||
  mongoose.model(
    "MenuItem",
    new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      imageUrl: String,
      categoryId: mongoose.Schema.Types.ObjectId,
      isVeg: Boolean,
    }),
  );
const Admin =
  mongoose.models.Admin ||
  mongoose.model(
    "Admin",
    new mongoose.Schema({
      name: String,
      email: String,
      profileImage: String,
      role: String,
    }),
  );
const Employee =
  mongoose.models.Employee ||
  mongoose.model(
    "Employee",
    new mongoose.Schema({
      name: String,
      position: String,
      email: String,
      phone: String,
      profileImage: String,
      salary: Number,
      joiningDate: Date,
    }),
  );
const ReservationOffer =
  mongoose.models.ReservationOffer ||
  mongoose.model(
    "ReservationOffer",
    new mongoose.Schema({
      title: String,
      description: String,
      advanceAmountPerPerson: Number,
      discountPercent: Number,
    }),
  );
const Deal =
  mongoose.models.Deal ||
  mongoose.model(
    "Deal",
    new mongoose.Schema({
      title: String,
      description: String,
      discountType: String,
      discountValue: Number,
      applicableOn: String,
      validFrom: Date,
      validTo: Date,
      imageUrl: String,
      isActive: Boolean,
    }),
  );
const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model(
    "Testimonial",
    new mongoose.Schema({
      customerName: String,
      rating: Number,
      comment: String,
      imageUrl: String,
    }),
  );
const Story =
  mongoose.models.Story ||
  mongoose.model(
    "Story",
    new mongoose.Schema({
      title: String,
      description: String,
      quote: String,
      images: [String],
    }),
  );
const Reservation =
  mongoose.models.Reservation ||
  mongoose.model(
    "Reservation",
    new mongoose.Schema({
      userName: String,
      email: String,
      date: Date,
      time: String,
      seats: Number,
      paymentStatus: String,
      totalAmount: Number,
    }),
  );

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Admin.deleteMany({}),
      Employee.deleteMany({}),
      ReservationOffer.deleteMany({}),
      Deal.deleteMany({}),
      Testimonial.deleteMany({}),
      Story.deleteMany({}),
      Reservation.deleteMany({}),
    ]);
    console.log("Cleared all existing data");

    // 1. Admin Profile
    await Admin.create({
      name: "Anubhav Singh",
      email: "anubhav@momsmagic.com",
      profileImage: "https://i.pravatar.cc/150?u=admin",
      role: "Super Admin",
    });
    console.log("Admin Profile seeded");

    // 2. Categories
    const coffee = await Category.create({
      name: "Coffee Section",
      description: "Aromatic and fresh brews",
    });
    const coldDrinks = await Category.create({
      name: "Cold Drinks & Mocktails",
      description: "Refreshing and icy treats",
    });
    const fastFood = await Category.create({
      name: "Fast Food (Noodles, Momos, etc.)",
      description: "Quick and delicious bites",
    });
    const cookies = await Category.create({
      name: "Cookies Section",
      description: "Crispy and sweet delights",
    });
    const pizza = await Category.create({
      name: "Pizza Section",
      description: "Cheesy and oven-fresh",
    });
    const cakes = await Category.create({
      name: "Cake & Pastry Section",
      description: "Sweet endings and celebrations",
    });

    // 3. Menu Items
    await MenuItem.create([
      // Coffee Section
      {
        name: "Espresso",
        description: "Rich and intense shot of pure coffee magic.",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800",
        categoryId: coffee._id,
        isVeg: true,
      },
      {
        name: "Cappuccino",
        description: "Perfectly balanced espresso, steamed milk, and foam.",
        price: 180,
        imageUrl:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800",
        categoryId: coffee._id,
        isVeg: true,
      },
      {
        name: "Café Latte",
        description: "Smooth espresso with a generous amount of steamed milk.",
        price: 190,
        imageUrl:
          "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800",
        categoryId: coffee._id,
        isVeg: true,
      },
      {
        name: "Mocha Coffee",
        description: "Indulgent blend of espresso, chocolate, and milk.",
        price: 210,
        imageUrl:
          "https://images.unsplash.com/photo-1596078841242-12f73dc697ef?auto=format&fit=crop&q=80&w=800",
        categoryId: coffee._id,
        isVeg: true,
      },
      {
        name: "Cold Coffee",
        description: "Classic chilled coffee blended with milk and ice cream.",
        price: 220,
        imageUrl:
          "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800",
        categoryId: coffee._id,
        isVeg: true,
      },

      // Cold Drinks & Mocktails
      {
        name: "Coca-Cola / Pepsi",
        description: "Chilled classic carbonated beverage.",
        price: 80,
        imageUrl:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800",
        categoryId: coldDrinks._id,
        isVeg: true,
      },
      {
        name: "Virgin Mojito",
        description: "Refreshing blend of mint, lime, and soda.",
        price: 160,
        imageUrl:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
        categoryId: coldDrinks._id,
        isVeg: true,
      },
      {
        name: "Lemon Iced Tea",
        description: "Classic tea infused with lemon and served over ice.",
        price: 140,
        imageUrl:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800",
        categoryId: coldDrinks._id,
        isVeg: true,
      },
      {
        name: "Fresh Lime Soda",
        description: "Zesty lime mixed with sparkling soda.",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
        categoryId: coldDrinks._id,
        isVeg: true,
      },
      {
        name: "Blue Lagoon",
        description: "Tropical blue curacao with lemonade and a hint of magic.",
        price: 180,
        imageUrl:
          "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800",
        categoryId: coldDrinks._id,
        isVeg: true,
      },

      // Fast Food
      {
        name: "Veg Hakka Noodles",
        description:
          "Stir-fried noodles with fresh vegetables and oriental spices.",
        price: 170,
        imageUrl:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
        categoryId: fastFood._id,
        isVeg: true,
      },
      {
        name: "Veg Momos (Steamed)",
        description: "Delicate dumplings filled with minced vegetables.",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800",
        categoryId: fastFood._id,
        isVeg: true,
      },
      {
        name: "Chicken Momos",
        description: "Steamed dumplings filled with juicy minced chicken.",
        price: 180,
        imageUrl:
          "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800",
        categoryId: fastFood._id,
        isVeg: false,
      },
      {
        name: "Veg Chowmein",
        description: "Classic street-style stir-fried noodles.",
        price: 160,
        imageUrl:
          "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=800",
        categoryId: fastFood._id,
        isVeg: true,
      },
      {
        name: "Masala Maggi",
        description:
          "Your favorite instant noodles with a magical masala twist.",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800",
        categoryId: fastFood._id,
        isVeg: true,
      },

      // Cookies Section
      {
        name: "Chocolate Chip Cookies",
        description: "Buttery cookies loaded with premium chocolate chips.",
        price: 90,
        imageUrl:
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800",
        categoryId: cookies._id,
        isVeg: true,
      },
      {
        name: "Oatmeal Raisin Cookies",
        description: "Wholesome cookies with oats and chewy raisins.",
        price: 95,
        imageUrl:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800",
        categoryId: cookies._id,
        isVeg: true,
      },
      {
        name: "Butter Cookies",
        description: "Classic rich and crumbly butter cookies.",
        price: 85,
        imageUrl:
          "https://images.unsplash.com/photo-1590080874088-eec64895b423?auto=format&fit=crop&q=80&w=800",
        categoryId: cookies._id,
        isVeg: true,
      },
      {
        name: "Double Chocolate Cookies",
        description: "Decadent cocoa cookies with chocolate chunks.",
        price: 110,
        imageUrl:
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800",
        categoryId: cookies._id,
        isVeg: true,
      },
      {
        name: "Almond Cookies",
        description: "Nutty cookies with crunchy almond bits.",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800",
        categoryId: cookies._id,
        isVeg: true,
      },

      // Pizza Section
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil.",
        price: 220,
        imageUrl:
          "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800",
        categoryId: pizza._id,
        isVeg: true,
      },
      {
        name: "Farmhouse Veg Pizza",
        description: "Loaded with capsicum, onion, tomato, and mushrooms.",
        price: 260,
        imageUrl:
          "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=800",
        categoryId: pizza._id,
        isVeg: true,
      },
      {
        name: "Paneer Tikka Pizza",
        description: "Spicy paneer tikka chunks with capsicum and onion.",
        price: 290,
        imageUrl:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
        categoryId: pizza._id,
        isVeg: true,
      },
      {
        name: "Chicken BBQ Pizza",
        description: "Smoky BBQ chicken with onions and mozzarella.",
        price: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
        categoryId: pizza._id,
        isVeg: false,
      },
      {
        name: "Corn & Cheese Pizza",
        description: "Sweet corn and extra cheese goodness.",
        price: 250,
        imageUrl:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
        categoryId: pizza._id,
        isVeg: true,
      },

      // Cake & Pastry Section
      {
        name: "Black Forest Pastry",
        description: "Classic chocolate sponge with cream and cherries.",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
        categoryId: cakes._id,
        isVeg: true,
      },
      {
        name: "Chocolate Truffle Cake",
        description: "Rich and dense chocolate ganache cake.",
        price: 140,
        imageUrl:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
        categoryId: cakes._id,
        isVeg: true,
      },
      {
        name: "Red Velvet Pastry",
        description: "Velvety red sponge with cream cheese frosting.",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&q=80&w=800",
        categoryId: cakes._id,
        isVeg: true,
      },
      {
        name: "Pineapple Pastry",
        description: "Light and airy pastry with fresh pineapple chunks.",
        price: 110,
        imageUrl:
          "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800",
        categoryId: cakes._id,
        isVeg: true,
      },
      {
        name: "Butterscotch Cake",
        description: "Crunchy butterscotch bits with caramel and cream.",
        price: 130,
        imageUrl:
          "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800",
        categoryId: cakes._id,
        isVeg: true,
      },
    ]);
    console.log("Menu Items seeded");

    // 4. Employees (Team)
    await Employee.create([
      {
        name: "Rajesh Sharma",
        position: "Café Manager",
        salary: 45000,
        joiningDate: new Date("2022-01-15"),
        profileImage: "https://i.pravatar.cc/150?u=emp1",
      },
      {
        name: "Priya Nair",
        position: "Assistant Manager",
        salary: 32000,
        joiningDate: new Date("2023-03-10"),
        profileImage: "https://i.pravatar.cc/150?u=emp2",
      },
      {
        name: "Amit Verma",
        position: "Head Chef",
        salary: 40000,
        joiningDate: new Date("2021-12-05"),
        profileImage: "https://i.pravatar.cc/150?u=emp3",
      },
      {
        name: "Sunita Patel",
        position: "Pastry Chef",
        salary: 35000,
        joiningDate: new Date("2022-06-20"),
        profileImage: "https://i.pravatar.cc/150?u=emp4",
      },
      {
        name: "Rakesh Yadav",
        position: "Line Cook",
        salary: 22000,
        joiningDate: new Date("2023-08-18"),
        profileImage: "https://i.pravatar.cc/150?u=emp5",
      },
      {
        name: "Neha Gupta",
        position: "Barista",
        salary: 20000,
        joiningDate: new Date("2024-02-02"),
        profileImage: "https://i.pravatar.cc/150?u=emp6",
      },
      {
        name: "Arjun Singh",
        position: "Senior Waiter",
        salary: 21000,
        joiningDate: new Date("2022-09-12"),
        profileImage: "https://i.pravatar.cc/150?u=emp7",
      },
      {
        name: "Kavita Joshi",
        position: "Waitress",
        salary: 18500,
        joiningDate: new Date("2024-04-25"),
        profileImage: "https://i.pravatar.cc/150?u=emp8",
      },
      {
        name: "Mohit Kumar",
        position: "Cashier",
        salary: 19500,
        joiningDate: new Date("2023-11-30"),
        profileImage: "https://i.pravatar.cc/150?u=emp9",
      },
      {
        name: "Pooja Mishra",
        position: "Customer Support",
        salary: 20000,
        joiningDate: new Date("2024-05-14"),
        profileImage: "https://i.pravatar.cc/150?u=emp10",
      },
      {
        name: "Suresh Chauhan",
        position: "Cleaner",
        salary: 15000,
        joiningDate: new Date("2021-07-01"),
        profileImage: "https://i.pravatar.cc/150?u=emp11",
      },
      {
        name: "Lakshmi Devi",
        position: "Housekeeping Staff",
        salary: 14500,
        joiningDate: new Date("2022-10-09"),
        profileImage: "https://i.pravatar.cc/150?u=emp12",
      },
      {
        name: "Imran Khan",
        position: "Delivery Executive",
        salary: 17000,
        joiningDate: new Date("2024-01-21"),
        profileImage: "https://i.pravatar.cc/150?u=emp13",
      },
      {
        name: "Deepak Tiwari",
        position: "Store Keeper",
        salary: 23000,
        joiningDate: new Date("2023-03-11"),
        profileImage: "https://i.pravatar.cc/150?u=emp14",
      },
    ]);
    console.log("Team seeded");

    // 5. Reservation Offers (Policies)
    await ReservationOffer.create([
      {
        title: "Standard Booking",
        description: "₹50 per person → Get 10% off total bill",
        advanceAmountPerPerson: 50,
        discountPercent: 10,
      },
      {
        title: "Priority Seating",
        description: "₹100 per person → Priority seating + 15% off",
        advanceAmountPerPerson: 100,
        discountPercent: 15,
      },
    ]);
    console.log("Booking Policies seeded");

    // 6. Active Deals
    await Deal.create([
      {
        title: "Weekend Family Feast",
        description:
          "Get 20% off on all main course items every Saturday & Sunday.",
        discountType: "percentage",
        discountValue: 20,
        applicableOn: "Pizza, Noodles, Chowmein",
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-03-31"),
        imageUrl:
          "https://images.unsplash.com/photo-1547928576-a4a33237eceb?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
      {
        title: "Super Saver Combo Deal",
        description:
          "Flat ₹120 off on combos above ₹499. Perfect for sharing meals.",
        discountType: "fixed",
        discountValue: 120,
        applicableOn: "Meal Combos & Family Packs",
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-04-30"),
        imageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
      {
        title: "Digital Payment Bonus",
        description:
          "Pay via UPI/Card & get 15% instant discount on your total bill.",
        discountType: "percentage",
        discountValue: 15,
        applicableOn: "Entire Menu",
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-05-31"),
        imageUrl:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
      {
        title: "Midweek Coffee Treat",
        description:
          "Buy 1 Get 1 FREE on all hot coffees every Tuesday & Wednesday.",
        discountType: "bogo",
        discountValue: 0,
        applicableOn: "Coffee Section",
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-04-30"),
        imageUrl:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
      {
        title: "🌸 Holi Special Colorful Feast",
        description:
          "Celebrate Holi with 25% off on festive combos, desserts & mocktails.",
        discountType: "percentage",
        discountValue: 25,
        applicableOn: "Combos, Cakes, Mocktails",
        validFrom: new Date("2026-03-10"),
        validTo: new Date("2026-03-16"),
        imageUrl:
          "https://images.unsplash.com/photo-1540331548438-59199049ee2c?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      },
    ]);
    console.log("Deals seeded");

    // 7. Testimonials
    await Testimonial.create([
      {
        customerName: "Riya Sharma",
        rating: 5,
        comment:
          "A magical experience indeed! The Butter Chicken is a must-try.",
        imageUrl: "https://i.pravatar.cc/150?u=riya",
      },
    ]);
    console.log("Testimonials seeded");

    // 8. Story
    await Story.create({
      title: "Our Story",
      description:
        "Founded on the belief that the best meals are those that bring people together, Mom's Magic started in a small home kitchen. Every spice is hand-picked, every dish is slow-cooked, and every experience is crafted to make you feel at home.",
      quote: "Where tradition meets elegance, and taste meets magic.",
      images: [
        "/logo.png",
        "https://images.unsplash.com/photo-1550966844-4919584d993c",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de",
      ],
    });
    console.log("Story seeded");

    // 9. Reservations (for Dasboard Stats)
    await Reservation.create([
      {
        userName: "Amit Kumar",
        email: "amit@example.com",
        date: new Date(),
        time: "19:00",
        seats: 4,
        paymentStatus: "paid",
        totalAmount: 2000,
      },
      {
        userName: "Suresh Raina",
        email: "suresh@example.com",
        date: new Date(),
        time: "20:30",
        seats: 2,
        paymentStatus: "paid",
        totalAmount: 1200,
      },
    ]);
    console.log("Reservations seeded");

    console.log("COMPREHENSIVE SEEDING SUCCESSFUL");
    process.exit(0);
  } catch (err) {
    console.error("SEEDING FAILED");
    console.error(err);
    process.exit(1);
  }
}

seed();
