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
      {/* Left — brand panel */}
      <div className="relative hidden w-1/2 items-center justify-center bg-ink-950 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,108,247,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-tomato-600 text-2xl font-black text-paper shadow-lg shadow-tomato-600/25">
            AT
          </div>
          <h2 className="text-3xl font-extrabold text-paper">
            أبو طارق — ملك الكشري
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-paper/50">
            The original Abo Tarek Koshari since 1950 — one branch only,
            Downtown Cairo.
          </p>
          <div className="mt-8 rounded-xl border border-ink-700 bg-ink-900/60 px-6 py-4">
            <p className="text-sm italic text-paper/40">
              &ldquo;الكشري مش بس أكل… ده ثقافة&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-1 items-center justify-center bg-ink-900 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tomato-600 text-sm font-black text-paper">
              AT
            </div>
            <span className="text-lg font-extrabold text-paper">أبو طارق</span>
          </div>

          <h1 className="mb-2 text-2xl font-extrabold text-paper">
            Admin Login
          </h1>
          <p className="mb-8 text-sm text-paper/40">
            Sign in to manage your restaurant.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2 rounded-lg border border-tomato-500/30 bg-tomato-500/10 px-4 py-3 text-sm text-tomato-500"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-paper/60"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/30" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abotarek.com"
                  className="w-full rounded-lg border border-ink-700 bg-ink-800 py-2.5 pl-10 pr-4 text-sm text-paper placeholder-paper/30 outline-none transition-colors focus:border-cobalt-500 focus:ring-1 focus:ring-cobalt-500/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-paper/60"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/30" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-700 bg-ink-800 py-2.5 pl-10 pr-4 text-sm text-paper placeholder-paper/30 outline-none transition-colors focus:border-cobalt-500 focus:ring-1 focus:ring-cobalt-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
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
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-paper/40 transition-colors hover:text-paper/70"
          >
            ← Back to site
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
