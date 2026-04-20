"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface MenuItem {
  id: number;
  category: string;
  name: string;
  price: number;
  src: string;
}

const Slide = ({
  slide,
  current,
  handleSlideClick,
}: {
  slide: MenuItem;
  current: number;
  handleSlideClick: (id: number) => void;
}) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const { id, category, name, price, src } = slide;

  const handleMouseMove = (event: React.MouseEvent) => {
    if (current !== id) return;
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--x",
      (event.clientX - (r.left + Math.floor(r.width / 2))).toString(),
    );
    el.style.setProperty(
      "--y",
      (event.clientY - (r.top + Math.floor(r.height / 2))).toString(),
    );
  };

  const handleMouseLeave = () => {
    slideRef.current?.style.setProperty("--x", "0");
    slideRef.current?.style.setProperty("--y", "0");
  };

  let classNames = "slide";
  if (current === id) classNames += " slide--current";
  else if (current - 1 === id) classNames += " slide--previous";
  else if (current + 1 === id) classNames += " slide--next";

  return (
    <li
      ref={slideRef}
      className={classNames}
      onClick={() => handleSlideClick(id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="slide__image-wrapper">
        <Image className="slide__image shadow-2xl" alt={name} src={src} fill />
      </div>

      <article className="slide__content text-white">
        <h4 className="text-secondary font-bold uppercase tracking-widest text-sm mb-2">
          {category}
        </h4>
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 drop-shadow-md">
          {name}
        </h2>
        <div className="flex flex-col items-center gap-4">
          <span className="text-2xl font-bold bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
            INR {price}
          </span>
          <button className="px-8 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red/80 transition-all shadow-lg">
            Add to Magic
          </button>
        </div>
      </article>
    </li>
  );
};

interface IMenuAPIData {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: {
    _id: string;
    name: string;
  };
  isVeg: boolean;
  isAvailable: boolean;
}

const MenuSlider = () => {
  const [current, setCurrent] = useState(0);
  const [menuItems, setMenuItems] = useState<IMenuAPIData[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();

        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          console.error("Menu data is not an array:", data);
          setMenuItems([]);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? menuItems.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === menuItems.length ? 0 : next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (menuItems.length === 0) return null;

  const wrapperTransform = {
    transform: `translateX(-${current * (100 / menuItems.length)}%)`,
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 overflow-hidden w-full min-h-[80vh]">
      <div className="slider w-[80vw] h-[60vh] md:w-[70vmin] md:h-[70vmin]">
        <ul className="slider__wrapper" style={wrapperTransform}>
          {menuItems.map((item, index) => (
            <Slide
              key={item._id}
              slide={{
                id: index,
                category: item.categoryId?.name || "Menu",
                name: item.name,
                price: item.price,
                src: item.imageUrl,
              }}
              current={current}
              handleSlideClick={setCurrent}
            />
          ))}
        </ul>

        {/* Controls */}
        <div className="flex justify-center gap-6 mt-16">
          <button
            onClick={handlePreviousClick}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-red shadow-warm border border-secondary/10 hover:bg-secondary/10 transition-all"
          >
            <ChevronLeft size={30} />
          </button>
          <button
            onClick={handleNextClick}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-red shadow-warm border border-secondary/10 hover:bg-secondary/10 transition-all"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuSlider;
