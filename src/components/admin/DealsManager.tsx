"use client";

import React, { useState, useEffect } from "react";
import { Plus, Calendar, Tag, Trash, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Deal {
  _id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom: string;
  validTo: string;
  imageUrl: string;
  isActive: boolean;
}

const DealsManager = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    imageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/deals", { cache: "no-store" });
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching deals:", error);
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
    const method = editingDeal ? "PUT" : "POST";
    const url = editingDeal ? `/api/deals/${editingDeal._id}` : "/api/deals";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingDeal(null);
        fetchDeals();
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await fetch(`/api/deals/${id}`, { method: "DELETE" });
      fetchDeals();
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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold">
            Manage Magic Deals
          </h1>
          <p className="text-foreground/50 mt-1">
            Create irresistible seasonal offers
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDeal(null);
            setFormData({
              title: "",
              description: "",
              discountType: "percentage",
              discountValue: 0,
              validFrom: new Date().toISOString().split("T")[0],
              validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              imageUrl: "",
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={20} /> New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {deals.map((deal) => (
          <div
            key={deal._id}
            className="bg-white rounded-3xl overflow-hidden shadow-warm border border-secondary/10 flex flex-col"
          >
            <div className="h-48 relative bg-secondary/10">
              {deal.imageUrl ? (
                <Image
                  src={deal.imageUrl}
                  alt={deal.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-secondary/30">
                  <Tag size={48} />
                </div>
              )}
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl">{deal.title}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
                  {deal.discountType === "percentage"
                    ? `${deal.discountValue}% OFF`
                    : `INR ${deal.discountValue} OFF`}
                </span>
              </div>
              <p className="text-sm text-foreground/60 mb-6 flex-1 line-clamp-3">
                {deal.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-foreground/40 mb-6 font-bold">
                <Calendar size={14} /> Valid till:{" "}
                {new Date(deal.validTo).toLocaleDateString()}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEditingDeal(deal);
                    setFormData({
                      title: deal.title,
                      description: deal.description,
                      discountType: deal.discountType,
                      discountValue: deal.discountValue,
                      validFrom: new Date(deal.validFrom)
                        .toISOString()
                        .split("T")[0],
                      validTo: new Date(deal.validTo)
                        .toISOString()
                        .split("T")[0],
                      imageUrl: deal.imageUrl,
                      isActive: deal.isActive,
                    });
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-secondary/10 text-secondary-accent rounded-xl font-bold hover:bg-secondary/20 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(deal._id)}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold">
                {editingDeal ? "Edit Deal" : "New Magic Deal"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-primary/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2">
                  Deal Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Weekend Family Feast"
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Discount Type
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none appearance-none"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Value
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Valid From
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2">
                    Valid To
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none"
                    value={formData.validTo}
                    onChange={(e) =>
                      setFormData({ ...formData, validTo: e.target.value })
                    }
                  />
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
                  Deal Image
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
                      <Tag size={32} className="text-secondary/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="deal-img"
                    />
                    <label
                      htmlFor="deal-img"
                      className="inline-block px-6 py-2 bg-secondary/10 text-secondary-accent rounded-xl font-bold cursor-pointer hover:bg-secondary/20 transition-all"
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all"
              >
                {editingDeal ? "Update Deal" : "Create Deal"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DealsManager;
