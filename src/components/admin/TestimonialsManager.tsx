"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Trash2,
  Shield,
  User,
  Star,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface Testimonial {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this testimonial from public view?")) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      fetchTestimonials();
    } catch (error) {
      console.error("Delete failed:", error);
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
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold">Customer Feedback</h1>
        <p className="text-foreground/50 mt-1">
          Manage what customers are saying about the magic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="bg-white p-8 rounded-[2rem] shadow-warm border border-secondary/10 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary/10 relative overflow-hidden flex items-center justify-center">
                  {t.imageUrl ? (
                    <Image
                      src={t.imageUrl}
                      alt={t.customerName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="text-secondary/40" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t.customerName}</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(t._id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <p className="text-foreground/70 italic leading-relaxed flex-1">
              &ldquo;{t.comment}&rdquo;
            </p>
            <div className="mt-8 pt-6 border-t border-secondary/10 flex justify-between items-center">
              <span className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-widest">
                <Shield size={14} /> Approved
              </span>
              <span className="text-xs text-foreground/30 font-bold">
                Public Testimonial
              </span>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-20">
          <MessageSquare size={64} className="mx-auto text-secondary/10 mb-4" />
          <h3 className="text-2xl font-bold text-foreground/30">
            No testimonials to show.
          </h3>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
