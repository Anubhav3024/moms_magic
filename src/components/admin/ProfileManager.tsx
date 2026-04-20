"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const ProfileManager = ({ onUpdate }: { onUpdate: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile", { cache: "no-store" });
      const data = await res.json();
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "", // Don't show password
          profileImage: data.profileImage || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      setFormData((prev) => ({ ...prev, profileImage: result.secure_url }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Profile updated magic!");
        onUpdate();
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
        <h1 className="text-4xl font-display font-bold text-secondary-accent">
          Admin Identity
        </h1>
        <p className="text-foreground/50 mt-1">
          Manage your professional presence and security
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-[2.5rem] p-12 shadow-warm border border-secondary/10"
        >
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] bg-secondary/10 relative overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                {formData.profileImage ? (
                  <Image
                    src={formData.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User size={64} className="text-secondary/20" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-red" />
                  </div>
                )}
              </div>
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-img"
              />
              <label
                htmlFor="profile-img"
                className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-red text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all"
              >
                <Camera size={20} />
              </label>
            </div>

            {/* Form Fields Section */}
            <div className="flex-1 space-y-8 w-full">
              <div className="flex items-center gap-4 text-green-500 mb-4 bg-green-50 w-fit px-4 py-2 rounded-xl">
                <ShieldCheck size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Verified Administrator
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2 flex items-center gap-2">
                    <User size={14} className="opacity-40" /> Display Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10 font-bold"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-60 ml-2 flex items-center gap-2">
                    <Mail size={14} className="opacity-40" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10 font-bold"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-60 ml-2 flex items-center gap-2">
                  <Lock size={14} className="opacity-40" /> New Password (Leave
                  blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full px-6 py-4 bg-primary/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="pt-8">
                <button
                  disabled={saving}
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-6 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/20 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save size={24} />
                  )}
                  Save Identity Changes
                </button>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ProfileManager;
