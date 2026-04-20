"use client";

import React from "react";
import { Tag, Calendar, ArrowRight } from "lucide-react";
import MotionTilt from "@/components/ui/MotionTilt";

interface IDeal {
  _id?: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom: string | Date;
  validTo: string | Date;
  imageUrl?: string;
}

const DealsPage = () => {
  const [deals, setDeals] = React.useState<IDeal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/deals");
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  const colors = ["bg-brand-red", "bg-secondary", "bg-secondary-accent"];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-primary/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-brand-red mb-4">
            Magical Deals
          </h1>
          <p className="text-foreground/60 text-lg">
            Exclusive offers for our valued guests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal, i) => (
            <MotionTilt
              key={deal._id || i}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-warm border border-secondary/10 flex flex-col will-change-transform"
              innerClassName="h-full"
              maxTiltDeg={12}
            >
              <div
                className={`${colors[i % colors.length]} p-8 text-white relative overflow-hidden`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  {deal.discountType === "percentage"
                    ? "Special Offer"
                    : "Fixed Discount"}
                </span>
                <h2 className="text-4xl font-bold mb-2">
                  {deal.discountType === "percentage"
                    ? `${deal.discountValue}% OFF`
                    : `INR ${deal.discountValue} OFF`}
                </h2>
                <h3 className="text-xl font-bold opacity-90">{deal.title}</h3>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <p className="text-foreground/70 mb-8 flex-1 leading-relaxed line-clamp-3">
                  {deal.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-secondary/10">
                  <div className="flex items-center gap-3 text-sm text-foreground/50">
                    <Calendar size={16} />
                    <span>
                      Valid till: {new Date(deal.validTo).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-4 bg-primary/20 text-brand-red rounded-2xl font-bold hover:bg-brand-red hover:text-white transition-all">
                    Apply Offer <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </MotionTilt>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-20">
            <Tag size={64} className="mx-auto text-secondary/20 mb-4" />
            <h3 className="text-2xl font-bold text-foreground/50">
              No active deals right now.
            </h3>
            <p className="text-foreground/40 mt-2">
              Check back later for magical offers!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
