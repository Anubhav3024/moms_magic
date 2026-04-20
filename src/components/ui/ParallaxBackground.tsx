"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Coffee, Pizza, Utensils, Star, Heart } from "lucide-react";

const springConfig = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

const ParallaxBackground = () => {
  const { scrollYProgress } = useScroll();
  const baseY = useSpring(scrollYProgress, springConfig);

  // Parallax shifts
  const y1 = useTransform(baseY, [0, 1], ["0%", "-50%"]);
  const y2 = useTransform(baseY, [0, 1], ["0%", "-30%"]);
  const y3 = useTransform(baseY, [0, 1], ["0%", "-20%"]);
  const rotate = useTransform(baseY, [0, 1], [0, 45]);
  const opacity = useTransform(baseY, [0, 0.2], [1, 0.5]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-primary/5">
      {/* Dynamic Background Gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)",
          opacity,
        }}
      />

      {/* Floating Elements - Layer 1 (Fastest) */}
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        <div className="absolute top-[10%] left-[5%] text-brand-red/10 animate-pulse">
          <Pizza size={120} />
        </div>
        <div className="absolute top-[40%] right-[10%] text-secondary-accent/10">
          <Coffee size={100} />
        </div>
        <div className="absolute top-[70%] left-[15%] text-brand-red/10">
          <Utensils size={80} />
        </div>
      </motion.div>

      {/* Floating Elements - Layer 2 */}
      <motion.div
        style={{ y: y2, rotate: rotate }}
        className="absolute inset-0"
      >
        <div className="absolute top-[20%] right-[20%] text-secondary-accent/5">
          <Star size={60} />
        </div>
        <div className="absolute top-[60%] left-[30%] text-brand-red/5">
          <Heart size={50} />
        </div>
      </motion.div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ef4444_1px,transparent_1px)] bg-size-[40px_40px]" />

      {/* Elegant Waves */}
      <svg
        className="absolute bottom-0 w-full h-[50vh] text-secondary/5 fill-current"
        viewBox="0 0 1440 320"
      >
        <motion.path
          style={{ y: y3 }}
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
};

export default ParallaxBackground;
