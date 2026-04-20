"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface IReservationOffer {
  _id: string;
  title: string;
  description: string;
  advanceAmountPerPerson: number;
  discountPercent: number;
}

type RazorpayOrderResponse = {
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  keyId: string;
};

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const ReservationPage = () => {
  const [step, setStep] = useState(1);
  const [offers, setOffers] = useState<IReservationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    _id?: string;
    bookingId: string;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "failed";
  } | null>(null);
  const [paying, setPaying] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    seats: 2,
    date: "",
    time: "",
    offerId: "",
    specialRequest: "",
  });

  React.useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/reservation-offers");
        const data = await res.json();
        const validatedOffers = Array.isArray(data) ? data : [];
        setOffers(validatedOffers);
        if (validatedOffers.length > 0) {
          setFormData((prev) => ({ ...prev, offerId: validatedOffers[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const totalPayable =
    formData.seats *
    (offers.find((o) => o._id === formData.offerId)?.advanceAmountPerPerson ||
      0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/30">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalAmount: totalPayable,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to create reservation");
      }

      setCreated(data.data);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-primary/30">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-warm border border-secondary/10"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-brand-red mb-4">
              {step === 3 ? "Reservation Confirmed" : "Book Your Table"}
            </h1>
            <p className="text-foreground/60">
              {step === 3
                ? "Your booking has been created successfully."
                : "Reserve a magical experience with us"}
            </p>
          </div>

          {step === 3 ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200">
                  <CheckCircle2 size={40} />
                </div>
              </div>

              <div className="bg-primary/10 p-8 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/60 font-semibold">
                    Booking ID
                  </span>
                  <span className="font-bold">{created?.bookingId || "MM-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/60 font-semibold">Guests</span>
                  <span className="font-bold">{formData.seats}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/60 font-semibold">Date</span>
                  <span className="font-bold">
                    {formData.date ? new Date(formData.date).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/60 font-semibold">Time</span>
                  <span className="font-bold">{formData.time || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-secondary/10 pt-4 text-lg">
                  <span className="font-semibold">Advance (Pending)</span>
                  <span className="text-brand-red font-bold">INR {totalPayable}</span>
                </div>
                <p className="text-xs text-foreground/40 text-center">
                  You can pay the advance via Razorpay if it is configured on the server.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  disabled={paying || created?.paymentStatus === "paid"}
                  onClick={async () => {
                    if (!created?._id) {
                      setError("Missing reservation id for payment");
                      return;
                    }

                    setError(null);
                    setPaying(true);
                    try {
                      const orderRes = await fetch("/api/razorpay", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          amount: totalPayable,
                          reservationId: created._id,
                        }),
                      });
                      const payload = (await orderRes.json()) as
                        | RazorpayOrderResponse
                        | { error?: string };
                      if (!orderRes.ok) {
                        const msg =
                          "error" in payload && payload.error
                            ? payload.error
                            : "Failed to create order";
                        throw new Error(msg);
                      }

                      if (!("order" in payload) || !payload.order?.id) {
                        throw new Error("Invalid order response");
                      }

                      // Load Razorpay checkout script
                      await new Promise<void>((resolve, reject) => {
                        const existing = document.querySelector(
                          "script[data-razorpay]",
                        ) as HTMLScriptElement | null;
                        if (existing) {
                          resolve();
                          return;
                        }
                        const script = document.createElement("script");
                        script.src = "https://checkout.razorpay.com/v1/checkout.js";
                        script.async = true;
                        script.dataset.razorpay = "true";
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error("Failed to load Razorpay"));
                        document.body.appendChild(script);
                      });

                      const keyId = payload.keyId || "";

                      if (!keyId) {
                        throw new Error(
                          "Razorpay key id is missing on the server",
                        );
                      }

                      const options: RazorpayOptions = {
                        key: keyId,
                        amount: payload.order.amount,
                        currency: payload.order.currency,
                        name: "Mom's Magic",
                        description: `Advance for ${created.bookingId}`,
                        order_id: payload.order.id,
                        handler: async (response) => {
                          const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              reservationId: created._id,
                              ...response,
                            }),
                          });
                          const verifyData = (await verifyRes.json()) as
                            | { success: true }
                            | { error?: string };
                          if (!verifyRes.ok) {
                            const msg =
                              "error" in verifyData && verifyData.error
                                ? verifyData.error
                                : "Payment verification failed";
                            throw new Error(msg);
                          }
                          setCreated((prev) =>
                            prev ? { ...prev, paymentStatus: "paid" } : prev,
                          );
                        },
                        prefill: {
                          name: formData.userName,
                          email: formData.email,
                          contact: formData.phone,
                        },
                        theme: { color: "#8b0000" },
                      };

                      const RazorpayCtor = window.Razorpay;
                      if (!RazorpayCtor) {
                        throw new Error("Razorpay SDK not available");
                      }
                      const rzp = new RazorpayCtor(options);
                      rzp.open();
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : "Payment failed");
                    } finally {
                      setPaying(false);
                    }
                  }}
                  className="flex-1 px-8 py-5 rounded-2xl font-bold bg-brand-red text-white shadow-xl hover:shadow-brand-red/20 transition-all disabled:opacity-50"
                >
                  {created?.paymentStatus === "paid"
                    ? "Paid"
                    : paying
                      ? "Opening Payment..."
                      : "Pay Advance"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreated(null);
                    setStep(1);
                    setFormData({
                      userName: "",
                      email: "",
                      phone: "",
                      seats: 2,
                      date: "",
                      time: "",
                      offerId: offers[0]?._id || "",
                      specialRequest: "",
                    });
                  }}
                  className="flex-1 px-8 py-5 rounded-2xl font-bold bg-secondary/10 text-secondary-accent hover:bg-secondary/20 transition-all"
                >
                  Book Another Table
                </button>
                <Link
                  href="/"
                  className="flex-1 px-8 py-5 rounded-2xl font-bold bg-brand-red text-white text-center shadow-xl hover:shadow-brand-red/20 transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-red/20 outline-none"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-red/20 outline-none"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-red/20 outline-none"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Number of Seats
                  </label>
                  <div className="flex items-center gap-4 bg-primary/20 p-2 rounded-2xl">
                    <button
                      type="button"
                      className="w-12 h-12 bg-white rounded-xl shadow-sm text-brand-red font-bold"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          seats: Math.max(1, formData.seats - 1),
                        })
                      }
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-lg">
                      {formData.seats}
                    </span>
                    <button
                      type="button"
                      className="w-12 h-12 bg-white rounded-xl shadow-sm text-brand-red font-bold"
                      onClick={() =>
                        setFormData({ ...formData, seats: formData.seats + 1 })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-60 ml-2">
                    Time Slot
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer._id}
                      onClick={() =>
                        setFormData({ ...formData, offerId: offer._id })
                      }
                      className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${
                        formData.offerId === offer._id
                          ? "border-brand-red bg-brand-red/5"
                          : "border-secondary/10 hover:border-secondary/30"
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-4">
                        {offer.description}
                      </p>
                      <p className="font-bold text-brand-red">
                        INR {offer.advanceAmountPerPerson} / person
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/20 p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span>Reservation for {formData.seats} people</span>
                    <span className="font-semibold">INR {totalPayable}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-secondary/20 pt-4">
                    <span>Total Payable Tomorrow</span>
                    <span className="text-brand-red">INR {totalPayable}</span>
                  </div>
                  <p className="text-xs text-foreground/40 text-center">
                    *This advance is non-refundable and will be adjusted in your
                    final bill.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-foreground/50 font-semibold hover:text-foreground"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto flex items-center gap-2 bg-brand-red text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-brand-red/20 transition-all hover:-translate-y-1"
              >
                {step === 1 ? "Select Offer" : submitting ? "Creating..." : "Confirm Booking"}
                <ChevronRight size={20} />
              </button>
            </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationPage;
