"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  Utensils,
} from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  _id: string;
  name: string;
}

interface MenuItem {
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

const MenuManager = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: "",
    isVeg: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch("/api/menu", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      if (Array.isArray(catsData) && catsData.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: catsData[0]._id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: result.secure_url }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/menu/${editingItem._id}` : "/api/menu";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        fetchData();
        setFormData({
          name: "",
          description: "",
          price: 0,
          imageUrl: "",
          categoryId: categories[0]?._id || "",
          isVeg: true,
        });
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this magic dish?")) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId?._id || "",
      isVeg: item.isVeg,
    });
    setIsModalOpen(true);
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
          <h1 className="text-4xl font-display font-bold">Manage Magic Menu</h1>
          <p className="text-foreground/50 mt-1">
            Curate your restaurant&apos;s delicious offerings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: "",
              description: "",
              price: 0,
              imageUrl: "",
              categoryId: categories[0]?._id || "",
              isVeg: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={20} /> Add New Dish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-3xl overflow-hidden shadow-warm border border-secondary/10 flex flex-col"
          >
            <div className="h-48 relative bg-secondary/5">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-secondary/30">
                  <Utensils size={48} />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  <span className="text-xs font-bold text-secondary-accent uppercase tracking-wider">
                    {item.categoryId?.name}
                  </span>
                </div>
                <span className="font-bold text-brand-red text-lg">
                  INR {item.price}
                </span>
              </div>
              <p className="text-sm text-foreground/60 mb-6 line-clamp-2 flex-1">
                {item.description}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary/10 text-secondary-accent rounded-xl font-bold hover:bg-secondary/20 transition-all"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold">
                {editingItem ? "Edit Dish" : "Add Magic Dish"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-primary/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Dish Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Category
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none appearance-none"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Price (INR)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: true })}
                      className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${formData.isVeg ? "bg-green-500 text-white border-green-500" : "border-secondary/10"}`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: false })}
                      className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${!formData.isVeg ? "bg-red-500 text-white border-red-500" : "border-secondary/10"}`}
                    >
                      Non-Veg
                    </button>
                  </div>
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

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Dish Image
                </label>
                <div className="flex gap-6 items-center">
                  <div className="w-32 h-32 rounded-3xl bg-primary/20 relative overflow-hidden flex items-center justify-center border-2 border-dashed border-secondary/20">
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload size={32} className="text-secondary/30" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin text-brand-red" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground/40 italic">
                      Upload a mouth-watering photo of your dish.
                    </p>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="img-upload"
                    />
                    <label
                      htmlFor="img-upload"
                      className="inline-block px-6 py-2 bg-secondary/10 text-secondary-accent rounded-xl font-bold cursor-pointer hover:bg-secondary/20 transition-all"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all"
              >
                {editingItem ? "Save Changes" : "Create Magic Dish"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
