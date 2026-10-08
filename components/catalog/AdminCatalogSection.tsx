"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Tag, Layers, RefreshCw } from "lucide-react";
import { CategoryManagerModal } from "@/components/catalog/CategoryManagerModal";
import { CreateProductModal } from "@/components/catalog/CreateProductModal";
import { ProductModerationControls } from "@/components/catalog/ProductModerationControls";

export function AdminCatalogSection({ userRoles }: { userRoles: string[] }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const isAdmin = userRoles.some((r) =>
    ["owner", "product_manager", "partner_manager"].includes(r)
  );

  const loadCatalogData = useCallback(() => {
    Promise.all([
      fetch("/api/categories?includeInactive=true").then((r) => r.json()),
      fetch("/api/products?limit=50").then((r) => r.json()),
    ])
      .then(([catRes, prodRes]) => {
        if (catRes.success) setCategories(catRes.categories || []);
        if (prodRes.success) setProducts(prodRes.items || []);
      })
      .catch((err) => {
        console.error("Failed to load catalog data:", err);
      });
  }, []);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Phase 2: Marketplace Catalog & Product Management
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Category hierarchies, Partner product moderation, inventory, and product reward rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCatalogData}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs transition"
            title="Refresh Catalog Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <CategoryManagerModal categories={categories} onRefresh={loadCatalogData} />
          <CreateProductModal categories={categories} onProductCreated={loadCatalogData} />
        </div>
      </div>

      {/* Category Hierarchy Overview */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Configured Category Hierarchy
        </h3>
        {categories.length === 0 ? (
          <div className="text-xs text-zinc-500 italic p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
            No categories defined yet. Use &quot;Manage / Add Categories&quot; to seed categories.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px] text-zinc-400">/{c.slug}</span>
                </div>
                {c.children && c.children.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-medium">Child Categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {c.children.map((ch: any) => (
                        <span
                          key={ch.id}
                          className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px]"
                        >
                          {ch.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Products & Listings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Product Listings & Moderation Table
          </h3>
          <span className="text-xs text-zinc-500">Total: {products.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 dark:border-zinc-800 text-[10px] uppercase">
                <th className="py-2.5">Title & SKU</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Price (PKR)</th>
                <th className="py-2.5">Stock</th>
                <th className="py-2.5">Context</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-zinc-500 italic">
                    No product listings recorded yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</div>
                      <div className="font-mono text-[10px] text-zinc-400">{p.sku}</div>
                    </td>
                    <td className="py-3">{p.categoryName || "Uncategorized"}</td>
                    <td className="py-3 font-semibold">Rs. {parseFloat(p.pricePkr).toLocaleString()}</td>
                    <td className="py-3">{p.stock} units</td>
                    <td className="py-3">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono">
                        {p.purchaseContext}
                      </span>
                    </td>
                    <td className="py-3">
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
                    <td className="py-3 text-right">
                      <ProductModerationControls
                        product={p}
                        isAdmin={isAdmin}
                        onActionComplete={loadCatalogData}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
