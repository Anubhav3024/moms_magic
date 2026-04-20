"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronRight, Zap } from "lucide-react";
import ParallaxBackground from "@/components/ui/ParallaxBackground";

interface ICategory {
  _id: string;
  name: string;
  description?: string;
}

interface IMenuItem {
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

const MenuPage = () => {
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [items, setItems] = React.useState<IMenuItem[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu"),
        ]);
        const catsData = await catsRes.json();
        const itemsData = await itemsRes.json();
        setCategories(Array.isArray(catsData) ? catsData : []);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryImage = (catId: string) => {
    const firstItem = items.find((item) => item.categoryId?._id === catId);
    return firstItem?.imageUrl || "/logo.png";
  };

  const getCategoryItems = (catId: string) => {
    return items.filter((item) => item.categoryId?._id === catId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-foreground relative overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 bg-linear-to-r from-brand-red to-orange-500 bg-clip-text text-transparent">
            The Magic Menu
          </h1>
          <p className="text-foreground/60 italic text-xl">
            &ldquo;Exquisite flavors crafted with a touch of magic.&rdquo;
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <motion.div
              layoutId={`card-${cat._id}`}
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className="relative h-96 rounded-[3rem] overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all border border-secondary/5"
              style={{ transformStyle: "preserve-3d" }}
              whileHover={{ scale: 1.02, y: -8, rotateX: 6, rotateY: -6 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <Image
                src={getCategoryImage(cat._id)}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10">
                <motion.div layoutId={`title-${cat._id}`}>
                  <h3 className="text-3xl font-display font-bold mb-2 text-white uppercase tracking-tight">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 text-brand-red font-bold">
                    <span className="text-sm tracking-widest uppercase">
                      Explore Items
                    </span>
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {activeCategory && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveCategory(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-100"
              />

              <div className="fixed inset-0 flex items-center justify-center z-110 p-4 pointer-events-none">
                <motion.div
                  layoutId={`card-${activeCategory}`}
                  className="w-full max-w-5xl max-h-[85vh] bg-white rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row shadow-3xl pointer-events-auto border border-black/5"
                >
                  {/* Left Column: Image */}
                  <div className="w-full md:w-5/12 h-64 md:h-auto relative">
                    <Image
                      src={getCategoryImage(activeCategory)}
                      alt="Category"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent md:hidden" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory(null);
                      }}
                      className="absolute top-8 left-8 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-black shadow-lg hover:bg-brand-red hover:text-white transition-all z-20 group"
                    >
                      <X
                        size={28}
                        className="group-hover:rotate-90 transition-transform duration-300"
                      />
                    </button>
                  </div>

                  {/* Right Column: Content */}
                  <div className="w-full md:w-7/12 flex flex-col p-8 md:p-16 overflow-hidden bg-white text-black">
                    <motion.div
                      layoutId={`title-${activeCategory}`}
                      className="mb-10"
                    >
                      <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-3 block">
                        Our Favorites
                      </span>
                      <h2 className="text-4xl md:text-5xl font-display font-bold text-black uppercase tracking-tight">
                        {categories.find((c) => c._id === activeCategory)?.name}
                      </h2>
                    </motion.div>

                    <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar space-y-8">
                      {getCategoryItems(activeCategory).map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-start group/item hover:bg-black/5 p-6 rounded-[2rem] transition-all border border-transparent hover:border-black/5"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-2xl font-bold group-hover/item:text-brand-red transition-colors text-black">
                                {item.name}
                              </h4>
                              {item.isVeg ? (
                                <div className="w-4 h-4 rounded-sm border-2 border-green-500/20 flex items-center justify-center text-black">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-sm border-2 border-red-500/20 flex items-center justify-center text-black">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                </div>
                              )}
                            </div>
                            <p className="text-base text-black/50 leading-relaxed group-hover/item:text-black/70 transition-colors max-w-md">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-black">
                              INR {item.price}
                            </div>
                            <button className="mt-2 px-4 py-2 bg-secondary/10 text-secondary-accent text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-red hover:text-white transition-all flex items-center gap-2 mx-auto md:ml-auto">
                              <Zap size={14} fill="currentColor" /> Add
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-black/5 flex items-center justify-between opacity-30 text-[10px] uppercase tracking-[0.3em] text-black">
                      <span>Chef Special Selection</span>
                      <span>MOMS MAGIC</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
