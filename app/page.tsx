import Link from "next/link";
import {
  Sparkles,
  Users,
  Store,
  Search,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white py-20 lg:py-28 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Authoritative Production Architecture</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
              The Next-Generation{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Marketplace & Patron
              </span>{" "}
              Rewards Network
            </h1>

            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              StakeDeals unites authentic e-commerce, SD Patron membership, SD Partner merchant storefronts, and an immutable 10-level reward engine powered by internal SDP and SDC wallets.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/catalog"
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/35"
              >
                Browse Marketplace Catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Join as SD Patron
              </Link>
              <Link
                href="/track-order"
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Search className="h-4 w-4 text-emerald-600" />
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Ecosystem Pillars */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Built on Pure Mathematical Integrity
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Every financial event is recorded into immutable ledgers with exact decimal precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Single Member Model (SD Patron)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                One unified user account holds all genealogy, sponsor relationships, rank history, orders, and wallet balances. No fragmented accounts.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  All members register as SD Patrons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Sponsor relationship permanently attached
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 mb-6">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                SD Partner Merchant Platform
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Approved Patrons gain SD Partner capabilities to list physical products, digital items, and services on the marketplace with customized agreements.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Integrated inside single dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Audited platform fee agreements
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 mb-6">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                10-Level MLM & SDC Engine
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                SDP is credited to qualifying buyers, while SDC distributes through 10 upline levels with fixed rules and fallback recipient protection.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  Fixed SDC tree amounts (no percentages)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  10-Day shipping-date maturity rule
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Rules Callout */}
      <section className="py-16 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent p-8 sm:p-12 dark:border-emerald-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Critical Business Distinction
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  SDC Wallet vs Rank Qualification Ledger
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  StakeDeals explicitly separates <strong>usable wallet balance</strong> from the <strong>historical rank metric</strong>.
                </p>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No SDC lockup:</strong> Qualifying business SDC credits normal wallet balance and remains freely spendable or withdrawable.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Spending does not diminish rank:</strong> Historical qualifying activity remains permanently preserved in the qualification ledger.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Admin-issued & Pool SDC:</strong> Freely usable in wallet, but strictly excluded from rank qualification metrics.</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold">10-Day Lifecycle Rule</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-400">
                    Day 1 = Shipping Date
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                    <span className="text-zinc-500 block text-[10px]">Day 1 to Day 10</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">Waiting & Return Window</strong>
                    <p className="text-[10px] text-zinc-500 mt-1">Eligible for item-level return and reward reversal</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                    <span className="text-zinc-500 block text-[10px]">Day 11+</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Matured & Finalized</strong>
                    <p className="text-[10px] text-zinc-500 mt-1">Outside return window, SDC becomes matured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Order Tracking Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Track Your StakeDeals Shipment
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Check delivery milestones and return deadline with your order tracking number.
            </p>
            <div className="pt-2">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Search className="h-4 w-4" />
                Go to Order Tracker
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
