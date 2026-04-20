"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import InteractiveHero from "@/components/ui/InteractiveHero";
import MotionTilt from "@/components/ui/MotionTilt";

interface HeroProps {
  story?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  deals?: Array<{
    title: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  }>;
}

const Hero = ({ story, deals }: HeroProps) => {
  const activeDeal = deals?.[0];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/10 -skew-x-12 transform origin-top-right -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-secondary/20 text-secondary-accent font-semibold text-sm mb-6 uppercase tracking-wider">
            Featured{" "}
            {activeDeal
              ? activeDeal.title
              : "Homemade Taste, Magical Experience"}
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-[1.1] mb-6">
            {story?.title?.split("&")[0] || "Where Every Meal"} <br />
            <span className="text-brand-red">
              {story?.title?.split("&")[1] || "Feels Like Home"}
            </span>
          </h1>
          <p className="text-lg text-foreground/70 mb-10 max-w-lg">
            {activeDeal
              ? activeDeal.description
              : "Savor the warmth of authentic recipes prepared with love. Mom's Magic brings you a blend of tradition and elegance on every plate."}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/reservation"
              className="px-8 py-4 bg-brand-red text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-brand-red/20 transition-all hover:-translate-y-1"
            >
              {activeDeal ? "Claim Offer" : "Reserve Table"}
            </Link>
            <Link
              href="/menu"
              className="px-8 py-4 border-2 border-brand-red/20 text-brand-red rounded-xl font-bold text-lg hover:bg-brand-red/5 transition-all"
            >
              View Menu
            </Link>
          </div>
        </motion.div>

        {/* Hero Image / Brand Identity - Interactive 3D Parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end w-full h-[500px]"
        >
          <MotionTilt className="w-full h-full" innerClassName="w-full h-full">
            <InteractiveHero />
          </MotionTilt>

          {/* Floating Badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-10 right-0 md:right-10 bg-white p-4 rounded-2xl shadow-xl z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white font-bold">
                5-star
              </div>
              <div>
                <p className="text-xs text-foreground/50 font-medium">
                  {activeDeal ? "Limited Time" : "Customer Rating"}
                </p>
                <p className="text-sm font-bold">
                  {activeDeal
                    ? activeDeal.discountType === "percentage"
                      ? `${activeDeal.discountValue}% OFF`
                      : `INR ${activeDeal.discountValue} OFF`
                    : "Premium Quality"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
