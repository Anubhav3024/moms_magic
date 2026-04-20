import mongoose, { Schema, Document } from "mongoose";

// --- Category Model ---
export interface ICategory extends Document {
  name: string;
  description?: string;
}
const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String },
});

// --- Menu Item Model ---
export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: mongoose.Types.ObjectId;
  isVeg: boolean;
  isAvailable: boolean;
}
const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// --- Deal Model ---
export interface IDeal extends Document {
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "bogo";
  discountValue: number;
  applicableOn: string;
  validFrom: Date;
  validTo: Date;
  imageUrl: string;
  isActive: boolean;
}
const DealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "bogo"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    applicableOn: { type: String },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// --- Reservation Model ---
export interface IReservation extends Document {
  userName: string;
  email: string;
  phone: string;
  seats: number;
  date: Date;
  time: string;
  slotKey?: string;
  status?: "requested" | "confirmed" | "cancelled" | "no_show";
  specialRequest?: string;
  offerId?: mongoose.Types.ObjectId;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentProvider?: "razorpay";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  bookingId: string;
}
const ReservationSchema = new Schema<IReservation>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    seats: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    slotKey: { type: String, index: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "cancelled", "no_show"],
      default: "confirmed",
    },
    specialRequest: { type: String },
    offerId: { type: Schema.Types.ObjectId, ref: "ReservationOffer" },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentProvider: { type: String, enum: ["razorpay"] },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    bookingId: { type: String, unique: true, required: true },
  },
  { timestamps: true },
);

// --- Reservation Offer Model ---
export interface IReservationOffer extends Document {
  title: string;
  description: string;
  advanceAmountPerPerson: number;
  discountPercent: number;
}
const ReservationOfferSchema = new Schema<IReservationOffer>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  advanceAmountPerPerson: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
});

// --- Testimonial Model ---
export interface ITestimonial extends Document {
  customerName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}
const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

// --- Story Model ---
export interface IStory extends Document {
  title: string;
  description: string;
  quote: string;
  images: string[];
}
const StorySchema = new Schema<IStory>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  quote: { type: String, required: true },
  images: [{ type: String }],
});

// --- Employee Model ---
export interface IEmployee extends Document {
  name: string;
  position: string;
  joiningDate: Date;
  salary: number;
  profileImage: string;
}
const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true },
    profileImage: { type: String },
  },
  { timestamps: true },
);

// --- Admin Model ---
export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  profileImage: string;
  role: string;
}
const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    profileImage: { type: String },
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);

// Exporting Models
export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
export const MenuItem =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
export const Deal =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);
export const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);
export const ReservationOffer =
  mongoose.models.ReservationOffer ||
  mongoose.model<IReservationOffer>("ReservationOffer", ReservationOfferSchema);
export const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
export const Story =
  mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
export const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
