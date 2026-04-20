"use client";

import React, { useState, useEffect } from "react";
import { Save, Upload, Edit, Loader2, Sparkles, Quote } from "lucide-react";
import Image from "next/image";

const StoryManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quote: "",
    images: ["", "", ""],
  });

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const res = await fetch("/api/story", { cache: "no-store" });
      const data = await res.json();
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          quote: data.quote || "",
          images: data.images?.length ? data.images : ["", "", ""],
        });
      }
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(index);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      const newImages = [...formData.images];
      newImages[index] = result.secure_url;
      setFormData({ ...formData, images: newImages });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Story and seasonal features updated magic!");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
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
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold">
          Brand & Story Editor
        </h1>
        <p className="text-foreground/50 mt-1">
          Manage your brand story and seasonal homepage content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-12">
        {/* Story Content Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-warm border border-secondary/10 space-y-8">
          <div className="flex items-center gap-4 text-brand-red mb-4">
            <Sparkles size={24} />
            <h2 className="text-2xl font-display font-bold">
              The Magical Journey
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold opacity-60 ml-2">
              Story Title
            </label>
            <input
              required
              type="text"
              className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold opacity-60 ml-2">
              Detailed Narrative
            </label>
            <textarea
              required
              rows={6}
              className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none resize-none focus:ring-2 focus:ring-brand-red/10"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold opacity-60 ml-2 flex items-center gap-2">
              <Quote size={14} className="opacity-40" /> Inspirational Quote
            </label>
            <input
              required
              type="text"
              className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none italic font-display text-lg"
              value={formData.quote}
              onChange={(e) =>
                setFormData({ ...formData, quote: e.target.value })
              }
            />
          </div>
        </div>

        {/* Visual Assets Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-warm border border-secondary/10 space-y-8">
          <div className="flex items-center gap-4 text-secondary-accent mb-4">
            <Sparkles size={24} />
            <h2 className="text-2xl font-display font-bold">
              Visual Brand Identity
            </h2>
          </div>
          <p className="text-sm text-foreground/40 italic">
            These images appear in the &quot;Our Story&quot; page and homepage
            seasonal highlights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {formData.images.map((img, i) => (
              <div key={i} className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">
                  Asset {i + 1}
                </label>
                <div className="h-48 rounded-3xl bg-primary/20 relative overflow-hidden flex items-center justify-center border-2 border-dashed border-secondary/10">
                  {img ? (
                    <Image
                      src={img}
                      alt={`Asset ${i}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Upload className="text-secondary/20" size={32} />
                  )}
                  {uploading === i && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin text-brand-red" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(i, e)}
                  className="hidden"
                  id={`asset-${i}`}
                />
                <label
                  htmlFor={`asset-${i}`}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-secondary/10 text-secondary-accent rounded-xl font-bold cursor-pointer hover:bg-secondary/20 transition-all"
                >
                  <Edit size={16} /> Update Photo
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={saving}
          type="submit"
          className="w-full flex items-center justify-center gap-3 py-6 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
          Save Brand Settings
        </button>
      </form>
    </div>
  );
};

export default StoryManager;
