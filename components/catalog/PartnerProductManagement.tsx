"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, RefreshCw } from "lucide-react";
import { CreateProductModal } from "@/components/catalog/CreateProductModal";

export function PartnerProductManagement({ partnerId }: { partnerId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const loadData = useCallback(() => {
    Promise.all([
      fetch(`/api/products?sellerId=${partnerId}&limit=50`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.success) setProducts(prodRes.items || []);
        if (catRes.success) setCategories(catRes.categories || []);
      })
      .catch((err) => {
        console.error("Failed to load partner products:", err);
      });
  }, [partnerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" />
            Your Listed Products ({products.length})
          </h3>
          <p className="text-[11px] text-zinc-500">
            Create listings, manage stock, and check listing moderation status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <CreateProductModal categories={categories} onProductCreated={loadData} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-zinc-400 dark:border-zinc-800 text-[10px] uppercase">
              <th className="py-2.5 px-4">Title & SKU</th>
              <th className="py-2.5 px-4">Price (PKR)</th>
              <th className="py-2.5 px-4">Available Stock</th>
              <th className="py-2.5 px-4">Moderation Status</th>
              <th className="py-2.5 px-4 text-right">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-500 italic">
                  You haven&apos;t created any listings yet. Click &quot;Create Product Listing&quot; above to list your first item.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</div>
                    <div className="font-mono text-[10px] text-zinc-400">{p.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    Rs. {parseFloat(p.pricePkr).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{p.stock} units</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "APPROVED"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400"
                          : p.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400"
                          : p.status === "REJECTED"
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {p.purchaseContext}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
