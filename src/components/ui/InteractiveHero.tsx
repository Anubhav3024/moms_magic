"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";

// --- Types ---

type ContainerConfig = {
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  coefficientX?: number;
  coefficientY?: number;
};

type ItemConfig = {
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  moveX?: number;
  moveY?: number;
  height?: number;
  width?: number;
};

const DEFAULT_ITEM: Required<ItemConfig> = {
  positionX: 50,
  positionY: 50,
  positionZ: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  moveX: 0,
  moveY: 0,
  height: 100,
  width: 100,
};

// --- Components ---

function ParallaxContainer({
  config,
  children,
}: {
  config?: ContainerConfig;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      // Calculate based on the parent container's bounds for precise centering
      const parent = el.parentElement;
      if (!parent) return;
      const bounds = parent.getBoundingClientRect();

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      // Distance mapping logic
      const startX =
        centerX - (config?.coefficientX ?? 0.5) * window.innerWidth;
      const endX = centerX + (config?.coefficientX ?? 0.5) * window.innerWidth;

      const startY =
        centerY - (config?.coefficientY ?? 0.5) * window.innerHeight;
      const endY = centerY + (config?.coefficientY ?? 0.5) * window.innerHeight;

      // GSAP utility to map screen coords to normalized range (-100 to 100)
      const posX = gsap.utils.mapRange(startX, endX, -100, 100, e.clientX);
      const posY = gsap.utils.mapRange(startY, endY, -100, 100, e.clientY);

      // Apply to CSS variables with smooth easing
      gsap.to(el, {
        duration: 0.8,
        ease: "power2.out",
        "--range-x": gsap.utils.clamp(-100, 100, posX),
        "--range-y": gsap.utils.clamp(-100, 100, posY),
        overwrite: true,
      });
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [config]);

  return (
    <div
      ref={ref}
      className="relative w-full h-full"
      style={
        {
          "--r": config?.rotate ?? 0,
          "--rx": config?.rotateX ?? 0,
          "--ry": config?.rotateY ?? 0,
          transform:
            "rotateX(calc(var(--rx) * var(--range-y, 0) * 1deg)) rotateY(calc(var(--ry) * var(--range-x, 0) * 1deg)) rotate(calc(var(--r) * var(--range-x, 0) * 1deg))",
          transformStyle: "preserve-3d",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function ParallaxItem({
  config,
  children,
}: {
  config?: ItemConfig;
  children: ReactNode;
}) {
  const p = { ...DEFAULT_ITEM, ...config };

  return (
    <div
      className="absolute pointer-events-none overflow-visible"
      style={
        {
          left: `${p.positionX}%`,
          top: `${p.positionY}%`,
          height: `${p.height}%`,
          width: `${p.width}%`,
          transformStyle: "preserve-3d",
          transform: `
            translate(-50%, -50%)
            translate3d(
              calc(var(--range-x, 0) * ${p.moveX}%),
              calc(var(--range-y, 0) * ${p.moveY}%),
              ${p.positionZ}vmin
            )
            rotateX(calc(var(--range-y, 0) * ${p.rotateX}deg))
            rotateY(calc(var(--range-x, 0) * ${p.rotateY}deg))
            rotate(calc(var(--range-x, 0) * ${p.rotate}deg))
          `,
        } as React.CSSProperties
      }
    >
      <div className="relative w-full h-full drop-shadow-2xl">{children}</div>
    </div>
  );
}

// --- Main Component ---

export default function InteractiveHero() {
  return (
    <div className="relative w-full h-[60vh] md:h-full flex items-center justify-center overflow-visible">
      <div
        className="w-[50vmin] h-[50vmin] max-w-[500px] max-h-[500px]"
        style={{ perspective: "50vmin" }}
      >
        <ParallaxContainer
          config={{
            rotate: 0.01,
            rotateX: -0.1,
            rotateY: 0.25,
            coefficientX: 0.75,
            coefficientY: 0.75,
          }}
        >
          {/* Chef Teddy (Center Foreground) */}
          <ParallaxItem
            config={{
              positionX: 52,
              positionY: 54,
              positionZ: 2,
              height: 75,
              width: 75,
              moveX: 0.15,
              moveY: -0.25,
            }}
          >
            <Image
              src="/assets/parallax/chef_bear.png"
              alt="Chef Teddy"
              fill
              className="object-contain"
              priority
            />
          </ParallaxItem>

          {/* Gas Stove (Ground / Base) */}
          <ParallaxItem
            config={{
              positionX: 50,
              positionY: 85,
              positionZ: 5,
              height: 25,
              width: 45,
              moveX: 0.8,
              moveY: -0.4,
            }}
          >
            <Image
              src="/assets/parallax/stove.png"
              alt="Stove"
              fill
              className="object-contain"
            />
          </ParallaxItem>

          {/* Cooking Pan (Floating Dynamic) */}
          <ParallaxItem
            config={{
              positionX: 80,
              positionY: 65,
              positionZ: 8,
              height: 28,
              width: 32,
              moveX: 1.2,
              moveY: -1,
              rotate: -0.2,
            }}
          >
            <Image
              src="/assets/parallax/pan.png"
              alt="Pan"
              fill
              className="object-contain"
            />
          </ParallaxItem>

          {/* Sauce Bottle */}
          <ParallaxItem
            config={{
              positionX: 18,
              positionY: 72,
              positionZ: 10,
              height: 22,
              width: 15,
              moveX: 1.4,
              moveY: -1.2,
              rotate: 0.3,
            }}
          >
            <Image
              src="/assets/parallax/sauce.png"
              alt="Sauce"
              fill
              className="object-contain"
            />
          </ParallaxItem>

          {/* Vegetable Basket */}
          <ParallaxItem
            config={{
              positionX: 15,
              positionY: 25,
              positionZ: 12,
              height: 20,
              width: 20,
              moveX: 1.6,
              moveY: -1.4,
              rotate: -0.4,
            }}
          >
            <Image
              src="/assets/parallax/veggies.png"
              alt="Veggies"
              fill
              className="object-contain"
            />
          </ParallaxItem>

          {/* Flying Egg */}
          <ParallaxItem
            config={{
              positionX: 85,
              positionY: 20,
              positionZ: 15,
              height: 12,
              width: 12,
              moveX: 2,
              moveY: -1.8,
              rotate: 0.6,
            }}
          >
            <Image
              src="/assets/parallax/egg.png"
              alt="Egg"
              fill
              className="object-contain"
            />
          </ParallaxItem>

          {/* Kitchen Tools */}
          <ParallaxItem
            config={{
              positionX: 50,
              positionY: 10,
              positionZ: 6,
              height: 18,
              width: 15,
              moveX: 1.1,
              moveY: -0.8,
              rotate: 0.5,
            }}
          >
            <Image
              src="/assets/parallax/tools.png"
              alt="Tools"
              fill
              className="object-contain"
            />
          </ParallaxItem>
        </ParallaxContainer>
      </div>
    </div>
  );
}
