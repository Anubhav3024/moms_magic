"use client";

import React, { useState, useEffect } from "react";
import { Plus, ShieldCheck, X, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Offer {
  _id: string;
  title: string;
  description: string;
  advanceAmountPerPerson: number;
  discountPercent: number;
}

const ReservationsManager = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    advanceAmountPerPerson: 0,
    discountPercent: 0,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/reservation-offers", { cache: "no-store" });
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingOffer ? "PUT" : "POST";
    const url = "/api/reservation-offers";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchOffers();
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-brand-red" size={48} />
      </div>
    );

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-primary/20 text-black">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold">Booking Policies</h1>
          <p className="text-foreground/50 mt-1">
            Manage reservation offers and booking advance settings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setFormData({
              title: "",
              description: "",
              advanceAmountPerPerson: 0,
              discountPercent: 0,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={20} /> Create New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-white rounded-[2rem] p-8 shadow-warm border border-secondary/10 flex flex-col"
          >
            <div className="p-3 bg-brand-red/10 text-brand-red rounded-2xl w-fit mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-2xl mb-2">{offer.title}</h3>
            <p className="text-sm text-foreground/60 leading-relaxed mb-8 flex-1">
              {offer.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary/10 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Advance/Person
                </p>
                <p className="text-xl font-bold text-black">
                  INR {offer.advanceAmountPerPerson}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Bill Discount
                </p>
                <p className="text-xl font-bold text-green-500">
                  {offer.discountPercent}%
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-secondary/10 text-secondary-accent rounded-xl font-bold hover:bg-secondary/20 transition-all opacity-50 cursor-not-allowed">
                Edit
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-50 cursor-not-allowed">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-3xl p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold">
                New Offer Policy
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-primary/20 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Offer Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Priority Seating"
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Advance (INR)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.advanceAmountPerPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        advanceAmountPerPerson: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Discount (%)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercent: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all"
              >
                Add Offer Policy
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManager;
