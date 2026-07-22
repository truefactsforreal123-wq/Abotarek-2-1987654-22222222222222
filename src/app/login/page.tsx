"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — login form */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-base font-black text-white shadow-lg shadow-red-500/20">
              AT
            </div>
            <div>
              <span className="block text-lg font-extrabold text-gray-900 tracking-tight">أبو طارق</span>
              <span className="text-[11px] text-gray-400 font-medium">Admin Panel</span>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Login
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Sign in to manage your restaurant
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abotarek.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
          >
            ← Back to site
          </Link>
        </motion.div>
      </div>

      {/* Right — founder image */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        <img
          src="/images/founder.jpg"
          alt="Abo Tarek Founder"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Brand overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <h2 className="text-4xl font-black text-white tracking-tight">
            أبو طارق
          </h2>
          <p className="mt-2 text-lg font-semibold text-white/70">
            Downtown Cairo
          </p>
          <p className="mt-4 text-sm text-white/50 max-w-sm">
            One branch only. Serving authentic Egyptian cuisine since 1950.
          </p>
        </div>
      </div>
    </div>
  );
}
