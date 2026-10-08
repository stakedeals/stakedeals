import Link from "next/link";
import { ShoppingBag, ShieldCheck, Clock, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Stake<span className="text-emerald-600 dark:text-emerald-400">Deals</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              StakeDeals is a modern full-stack marketplace, patron and partner rewards network featuring a 10-level reward engine, internal SDP and SDC wallet system, and authentic e-commerce.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Standard 10-Day Return & Maturity Guarantee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Marketplace
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  Partner Services
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-emerald-600 transition-colors">
                  Customer Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition-colors">
                  Member Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Patron & Partner */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Patron & Partner
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-emerald-600 transition-colors">
                  Join as SD Patron
                </Link>
              </li>
              <li>
                <Link href="/#partner-section" className="hover:text-emerald-600 transition-colors">
                  Become an SD Partner
                </Link>
              </li>
              <li>
                <Link href="/#rewards-section" className="hover:text-emerald-600 transition-colors">
                  SDP & SDC Reward Overview
                </Link>
              </li>
              <li>
                <Link href="/#mlm-section" className="hover:text-emerald-600 transition-colors">
                  10-Level Reward Structure
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Trust */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Policies & Compliance
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <span className="hover:text-emerald-600 cursor-pointer">
                  10-Day Return & Refund Policy
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 cursor-pointer">
                  Partner Agreement Terms
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 cursor-pointer">
                  Terms & Conditions
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} StakeDeals Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verified Immutable Ledger
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              Production Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
