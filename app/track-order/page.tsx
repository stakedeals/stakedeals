"use client";

import { useState } from "react";
import { Search, Package, Clock, CheckCircle2 } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample verified tracked order state for demonstration of the timeline
  const [orderData, setOrderData] = useState<any | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setSearched(true);

    setTimeout(() => {
      // Mock order preview matching the state machine rules in master prompt
      setOrderData({
        orderNumber: orderNumber.toUpperCase(),
        orderDate: "2026-10-01",
        shippingDate: "2026-10-03", // Day 1
        returnDeadline: "2026-10-12", // Day 10
        carrier: "TCS Express",
        trackingNumber: "TCS-98471203",
        status: "SHIPPED",
        paymentStatus: "CONFIRMED",
        items: [
          {
            title: "StakeDeals Patron Welcome Bundle",
            quantity: 1,
            seller: "StakeDeals Official",
          },
        ],
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Customer Order Tracking
        </h1>
        <p className="text-xs text-zinc-500">
          Enter your StakeDeals Order Number to track real-time delivery status, shipping verification, and return window.
        </p>

        <form onSubmit={handleTrack} className="flex gap-2 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. SD-ORD-2026-001"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm uppercase shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {searched && orderData && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-8">
          {/* Header summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 dark:border-zinc-800 pb-6 gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500">Order Reference</span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {orderData.orderNumber}
              </h2>
              <p className="text-xs text-zinc-400">Placed on {orderData.orderDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Payment: {orderData.paymentStatus}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Status: {orderData.status}
              </span>
            </div>
          </div>

          {/* 10-Day Rule Highlight Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block">
                  10-Calendar-Day Return & Maturity Guarantee
                </strong>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Shipping Date (Day 1) was <strong>{orderData.shippingDate}</strong>. Return deadline (Day 10) is <strong>{orderData.returnDeadline}</strong>.
                </span>
              </div>
            </div>
            <span className="bg-emerald-600 text-white font-semibold px-3 py-1 rounded-lg text-[11px] shrink-0">
              Active Return Window
            </span>
          </div>

          {/* Shipment details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <span className="text-zinc-400 block text-[10px]">Carrier</span>
              <strong className="text-zinc-800 dark:text-zinc-200">{orderData.carrier}</strong>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <span className="text-zinc-400 block text-[10px]">Tracking Number</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-mono">
                {orderData.trackingNumber}
              </strong>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <span className="text-zinc-400 block text-[10px]">Shipping Date (Day 1)</span>
              <strong className="text-zinc-800 dark:text-zinc-200">{orderData.shippingDate}</strong>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Fulfillment Timeline
            </h3>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="text-xs">
                  <strong>ORDER_PLACED</strong> — Order received and created
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="text-xs">
                  <strong>PAYMENT_CONFIRMED</strong> — Admin verified payment receipt
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="text-xs">
                  <strong>PROCESSING</strong> — Order packaged by SD Partner
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="text-xs">
                  <strong>SHIPPED</strong> — Handed over to {orderData.carrier} (Day 1 initialized)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
