"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-warm border border-secondary/10"
      >
        <div className="text-center mb-10">
          <Image
            src="/moms-magic-logo.jpeg"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto rounded-full mb-6 shadow-md"
          />
          <h1 className="text-3xl font-display font-bold text-brand-red">
            Admin Portal
          </h1>
          <p className="text-foreground/50 mt-2">
            Managing the magic behind the scenes
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-60 ml-2 font-black text-black">
              Email Address
            </label>
            <div className="relative">
              <User
                className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30"
                size={20}
              />
              <input
                required
                type="email"
                placeholder="admin@momsmagic.com"
                className="w-full pl-14 pr-6 py-4 bg-primary/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-red/20 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-60 ml-2 font-black text-black">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30"
                size={20}
              />
              <input
                required
                type="password"
                placeholder="********"
                className="w-full pl-14 pr-6 py-4 bg-primary/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-red/20 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-brand-red/20 transition-all hover:scale-[1.02]"
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}{" "}
            <ArrowRight size={20} />
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
              {error}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
