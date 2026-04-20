import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdSchema = z
  .string()
  .trim()
  .regex(objectIdRegex, "Invalid id");

const nonEmpty = z.string().trim().min(1);

const dateFromInput = z.preprocess((value) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  }
  return value;
}, z.date());

export const adminLoginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  })
  .strict();

export const adminBootstrapSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email(),
    password: z.string().min(8),
  })
  .strict();

export const adminProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(8).optional(),
    profileImage: z.string().trim().url().or(z.literal("")).optional(),
  })
  .strict();

export const reservationCreateSchema = z
  .object({
    userName: z.string().trim().min(1).max(100),
    email: z.string().trim().email(),
    phone: z.string().trim().min(6).max(20),
    seats: z.number().int().min(1).max(100),
    date: dateFromInput,
    time: z.string().trim().min(1).max(20),
    offerId: objectIdSchema.optional(),
    specialRequest: z.string().trim().max(1000).optional(),
  })
  .strict();

export const razorpayOrderCreateSchema = z
  .object({
    reservationId: objectIdSchema,
    currency: z.string().trim().min(3).max(3).optional(),
  })
  .strict();

export const razorpayVerifySchema = z
  .object({
    reservationId: objectIdSchema,
    razorpay_order_id: nonEmpty,
    razorpay_payment_id: nonEmpty,
    razorpay_signature: nonEmpty,
  })
  .strict();

export const categoryCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
  })
  .strict();

export const menuItemUpsertSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    price: z.number().nonnegative(),
    imageUrl: z.string().trim().url(),
    categoryId: objectIdSchema,
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict();

export const dealCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(2000),
    discountType: z.enum(["percentage", "fixed", "bogo"]),
    discountValue: z.number().nonnegative(),
    applicableOn: z.string().trim().max(200).optional(),
    validFrom: dateFromInput,
    validTo: dateFromInput,
    imageUrl: z.string().trim().url(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const reservationOfferCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(1000),
    advanceAmountPerPerson: z.number().nonnegative(),
    discountPercent: z.number().min(0).max(100),
  })
  .strict();

export const testimonialCreateSchema = z
  .object({
    customerName: z.string().trim().min(1).max(120),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).max(2000),
    imageUrl: z.string().trim().url().optional(),
  })
  .strict();

export const employeeUpsertSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    position: z.string().trim().min(1).max(120),
    joiningDate: dateFromInput,
    salary: z.number().nonnegative(),
    profileImage: z.string().trim().url().or(z.literal("")),
  })
  .strict();

export const storyUpsertSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(5000),
    quote: z.string().trim().min(1).max(500),
    images: z.array(z.string().trim().min(1)).max(20).optional(),
  })
  .strict();

export function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function asValidationMessage(error: unknown): string | null {
  if (error instanceof z.ZodError) {
    return formatValidationError(error);
  }
  return null;
}
