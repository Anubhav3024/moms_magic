"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

type MotionTiltProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  disabled?: boolean;
  perspective?: number;
  maxTiltDeg?: number;
  scaleOnHover?: number;
};

export default function MotionTilt({
  children,
  className,
  innerClassName,
  disabled = false,
  perspective = 900,
  maxTiltDeg = 10,
  scaleOnHover = 1.02,
}: MotionTiltProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [maxTiltDeg, -maxTiltDeg]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTiltDeg, maxTiltDeg]);
  const transform = useMotionTemplate`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      whileHover={disabled ? undefined : { scale: scaleOnHover }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className={innerClassName}
        style={{
          transform: disabled ? undefined : transform,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

