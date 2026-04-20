"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote, Star } from "lucide-react";

interface IStory {
  _id?: string;
  title: string;
  description: string;
  quote: string;
  images: string[];
}

interface ITestimonial {
  _id?: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}

const StoryPage = () => {
  const [story, setStory] = React.useState<IStory | null>(null);
  const [testimonials, setTestimonials] = React.useState<ITestimonial[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, testsRes] = await Promise.all([
          fetch("/api/story"),
          fetch("/api/testimonials"),
        ]);
        const storyData = await storyRes.json();
        const testsData = await testsRes.json();
        setStory(Array.isArray(storyData) ? storyData[0] : storyData);
        setTestimonials(Array.isArray(testsData) ? testsData : []);
      } catch (error) {
        console.error("Error fetching story data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  // Fallback if data is missing
  const displayStory = story || {
    title: "Our Story",
    description: "Loading our magical journey...",
    quote: "Tradition meets elegance.",
    images: ["/logo.png", "/logo.png", "/logo.png"],
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h1 className="text-5xl font-display font-bold text-brand-red mb-8">
              {displayStory.title}
            </h1>
            <div className="space-y-6 text-lg text-foreground/70 leading-relaxed">
              <p>{displayStory.description}</p>
              <div className="pt-8 border-l-4 border-brand-red pl-6 italic text-2xl font-display text-brand-red">
                &ldquo;{displayStory.quote}&rdquo;
              </div>
            </div>
          </motion.div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-64 rounded-3xl overflow-hidden shadow-xl bg-secondary/10 flex items-center justify-center relative">
                <Image
                  src={displayStory.images?.[0] || "/logo.png"}
                  alt="Magic Moments 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="h-80 rounded-3xl overflow-hidden shadow-xl relative">
                <Image
                  src={displayStory.images?.[1] || "/logo.png"}
                  alt="Magic Moments 2"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="pt-12 space-y-4">
              <div className="h-80 rounded-3xl overflow-hidden shadow-xl relative">
                <Image
                  src={displayStory.images?.[2] || "/logo.png"}
                  alt="Magic Moments 3"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="h-64 rounded-3xl overflow-hidden shadow-xl relative flex items-center justify-center bg-brand-red/5">
                <Image
                  src="/logo.png"
                  alt="Mom's Magic Logo"
                  width={150}
                  height={150}
                  className="opacity-50 grayscale"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <section className="py-20 bg-primary/20 rounded-[3rem] px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              What Our Customers Say
            </h2>
            <div className="w-24 h-1 bg-brand-red mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-3xl shadow-warm relative"
              >
                <Quote
                  className="absolute top-8 right-8 text-secondary/20"
                  size={48}
                />
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src={t.imageUrl || `https://i.pravatar.cc/150?u=${i}`}
                    alt={t.customerName}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{t.customerName}</h4>
                    <div className="flex text-secondary-accent">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-foreground/70 italic leading-relaxed">
                  &quot;{t.comment}&quot;
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryPage;
