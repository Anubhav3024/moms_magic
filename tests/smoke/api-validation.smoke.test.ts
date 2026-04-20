import { describe, expect, it } from "vitest";
import {
  adminLoginSchema,
  adminProfileUpdateSchema,
  menuItemUpsertSchema,
  reservationCreateSchema,
  razorpayVerifySchema,
} from "../../src/lib/validation";
import {
  amountToMinorUnits,
  computeReservationAdvanceAmount,
  hasExactAmountAndCurrencyMatch,
} from "../../src/lib/paymentIntegrity";

describe("auth smoke", () => {
  it("accepts valid admin login payload", () => {
    const parsed = adminLoginSchema.parse({
      email: "admin@example.com",
      password: "secret123",
    });
    expect(parsed.email).toBe("admin@example.com");
  });

  it("rejects extra login fields", () => {
    expect(() =>
      adminLoginSchema.parse({
        email: "admin@example.com",
        password: "secret123",
        role: "admin",
      }),
    ).toThrow();
  });
});

describe("reservation create smoke", () => {
  it("accepts a valid reservation payload", () => {
    const parsed = reservationCreateSchema.parse({
      userName: "John",
      email: "john@example.com",
      phone: "9876543210",
      seats: 4,
      date: "2026-04-25T18:30:00.000Z",
      time: "19:00",
      specialRequest: "Window seat",
    });
    expect(parsed.seats).toBe(4);
    expect(parsed.date instanceof Date).toBe(true);
  });

  it("rejects client-provided totalAmount field", () => {
    expect(() =>
      reservationCreateSchema.parse({
        userName: "John",
        email: "john@example.com",
        phone: "9876543210",
        seats: 4,
        date: "2026-04-25T18:30:00.000Z",
        time: "19:00",
        totalAmount: 1,
      }),
    ).toThrow();
  });

  it("computes advance amount from trusted values", () => {
    expect(
      computeReservationAdvanceAmount({
        seats: 3,
        advanceAmountPerPerson: 150,
      }),
    ).toBe(450);
  });
});

describe("razorpay verify smoke", () => {
  it("validates verify payload shape", () => {
    const parsed = razorpayVerifySchema.parse({
      reservationId: "507f1f77bcf86cd799439011",
      razorpay_order_id: "order_123",
      razorpay_payment_id: "pay_123",
      razorpay_signature: "abc",
    });
    expect(parsed.razorpay_order_id).toBe("order_123");
  });

  it("enforces exact amount/currency integrity", () => {
    const ok = hasExactAmountAndCurrencyMatch({
      expectedAmount: amountToMinorUnits(450),
      expectedCurrency: "INR",
      actualAmount: 45000,
      actualCurrency: "INR",
    });
    expect(ok).toBe(true);

    const bad = hasExactAmountAndCurrencyMatch({
      expectedAmount: 45000,
      expectedCurrency: "INR",
      actualAmount: 44000,
      actualCurrency: "INR",
    });
    expect(bad).toBe(false);
  });
});

describe("admin CRUD smoke", () => {
  it("accepts a partial profile update", () => {
    const parsed = adminProfileUpdateSchema.parse({
      name: "Admin Name",
      profileImage: "https://example.com/avatar.png",
    });
    expect(parsed.name).toBe("Admin Name");
  });

  it("enforces allowlist on menu item create/update payload", () => {
    expect(() =>
      menuItemUpsertSchema.parse({
        name: "Paneer",
        description: "Fresh paneer",
        price: 299,
        imageUrl: "https://example.com/food.png",
        categoryId: "507f1f77bcf86cd799439011",
        injected: "nope",
      }),
    ).toThrow();
  });
});
