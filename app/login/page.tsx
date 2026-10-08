"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

const DEV_DEFAULT_PASSWORD = "Password123!";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const setDevCredentials = (email: string) => {
    setIdentifier(email);
    setPassword(DEV_DEFAULT_PASSWORD);
    setError(null);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign In to StakeDeals
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Access your SD Patron & Partner Dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email or Username
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or username"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Development Quick Role Switcher */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Development Test Credentials (Click to prefill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDevCredentials("owner@stakedeals.com")}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-left hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <strong className="block text-purple-600 dark:text-purple-400">Owner (Admin)</strong>
              <span className="text-zinc-500 text-[10px]">owner@stakedeals.com</span>
            </button>
            <button
              type="button"
              onClick={() => setDevCredentials("cashmgr@stakedeals.com")}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-left hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <strong className="block text-blue-600 dark:text-blue-400">Cash Manager</strong>
              <span className="text-zinc-500 text-[10px]">cashmgr@stakedeals.com</span>
            </button>
            <button
              type="button"
              onClick={() => setDevCredentials("patron1@stakedeals.com")}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-left hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <strong className="block text-emerald-600 dark:text-emerald-400">SD Patron 1</strong>
              <span className="text-zinc-500 text-[10px]">patron1@stakedeals.com</span>
            </button>
            <button
              type="button"
              onClick={() => setDevCredentials("partner1@stakedeals.com")}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-left hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <strong className="block text-teal-600 dark:text-teal-400">SD Partner</strong>
              <span className="text-zinc-500 text-[10px]">partner1@stakedeals.com</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500">
          Do not have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
            Register as SD Patron
          </Link>
        </div>
      </div>
    </div>
  );
}
