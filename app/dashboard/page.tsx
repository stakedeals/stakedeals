"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Store,
  Share2,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Award,
} from "lucide-react";
import { PartnerProductManagement } from "@/components/catalog/PartnerProductManagement";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const copyReferral = () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-xs text-zinc-500">Loading Member Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Greeting & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              SD Patron Member
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-zinc-400 font-mono">ID: {user.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            Welcome, {user.profile?.fullName || user.username}!
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {user.partnerStatus === "APPROVED"
              ? "Your account has active SD Partner merchant privileges."
              : "Standard SD Patron account with access to marketplace deals and 10-level rewards."}
          </p>
        </div>

        {/* Referral Link Quick Share */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Referral Code: <span className="font-mono text-emerald-600">{user.referralCode}</span>
              </span>
            </div>
            <button
              onClick={copyReferral}
              className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* Wallets & Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SDP Wallet */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">SDP Wallet</h3>
                <span className="text-[10px] text-zinc-500">Buyer-side qualifying reward</span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400">Available Balance</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {user.wallets?.sdp?.balance || "0.0000"} <span className="text-sm text-emerald-600">SDP</span>
            </div>
            <span className="text-xs text-zinc-500">
              {user.rates?.sdpRate
                ? `Approx. ₨ ${(Number(user.wallets?.sdp?.balance || 0) * Number(user.rates.sdpRate)).toFixed(2)} PKR`
                : "PKR Conversion Rate: Pending Admin Configuration"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
              <span className="text-[10px] text-zinc-400 block">Pending / Immature</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {user.wallets?.sdp?.pendingBalance || "0.0000"} SDP
              </span>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
              <span className="text-[10px] text-zinc-400 block">Withdrawn Total</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {user.wallets?.sdp?.withdrawnTotal || "0.0000"} SDP
              </span>
            </div>
          </div>
        </div>

        {/* SDC Wallet */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">SDC Wallet</h3>
                <span className="text-[10px] text-zinc-500">10-level tree & marketplace currency</span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full dark:bg-teal-950 dark:text-teal-300">
              Usable SDC
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400">Usable Wallet SDC</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {user.wallets?.sdc?.balance || "0.0000"} <span className="text-sm text-teal-600">SDC</span>
            </div>
            <span className="text-xs text-zinc-500">
              {user.rates?.sdcRate
                ? `Approx. ₨ ${(Number(user.wallets?.sdc?.balance || 0) * Number(user.rates.sdcRate)).toFixed(2)} PKR`
                : "PKR Conversion Rate: Pending Admin Configuration"}
            </span>
          </div>

          <div className="rounded-xl border border-teal-200/50 bg-teal-50/50 p-3 dark:border-teal-900/40 dark:bg-teal-950/30 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-teal-900 dark:text-teal-300">
              <Award className="h-4 w-4" />
              <span>Rank-Qualifying SDC Metric: {user.rankQualifyingSdc || "0.0000"} SDC</span>
            </div>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">
              Spending, transferring, or withdrawing your usable SDC will NEVER reduce your historical rank qualification.
            </p>
          </div>
        </div>
      </div>

      {/* SD Partner Merchant Privileges Card */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                SD Partner Merchant Platform
              </h2>
            </div>
            <p className="text-xs text-zinc-500 max-w-xl">
              {user.partnerStatus === "APPROVED"
                ? `You are an authorized SD Partner (${user.profile?.businessName || "Registered Merchant"}). Your products and services can be listed on the StakeDeals marketplace.`
                : "Want to sell products or services on StakeDeals? Apply for SD Partner status to add merchant features to this exact account."}
            </p>
          </div>

          <div className="shrink-0">
            {user.partnerStatus === "APPROVED" ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Partner Approved
              </span>
            ) : user.partnerStatus === "PENDING" ? (
              <span className="rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Application Pending Review
              </span>
            ) : (
              <button
                onClick={() => alert("Partner application feature will open in the next phase.")}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Become an SD Partner
              </button>
            )}
          </div>
        </div>

        {user.partnerStatus === "APPROVED" && (
          <PartnerProductManagement partnerId={user.id} />
        )}
      </div>
    </div>
  );
}
