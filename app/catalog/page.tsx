import Link from "next/link";
import { queryProducts } from "@/lib/domain/products/service";
import { getAllCategories } from "@/lib/domain/categories/service";
import { Search, Tag, CheckCircle2, ShieldCheck, ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    child?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const categories = await getAllCategories();

  const selectedCategory = categories.find((c) => c.slug === params.category);
  const selectedChild = selectedCategory?.children?.find((ch) => ch.slug === params.child);

  const currentPage = params.page ? parseInt(params.page) : 1;

  const { items: products, pagination } = await queryProducts({
    categoryId: selectedCategory?.id,
    childCategoryId: selectedChild?.id,
    search: params.q,
    page: currentPage,
    limit: 12,
    isPublicOnly: true,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Merchant Products</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Marketplace Catalog</h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse approved listings from authenticated SD Partners
            </p>
          </div>

          <form action="/catalog" method="GET" className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search products, brands, SKUs..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.child && <input type="hidden" name="child" value={params.child} />}
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Categories Bar */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Categories
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/catalog"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                !params.category
                  ? "bg-emerald-500 text-white font-semibold"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              All Categories
            </Link>
            {categories.map((c) => {
              const active = params.category === c.slug;
              return (
                <Link
                  key={c.id}
                  href={`/catalog?category=${c.slug}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>

          {/* Child categories if parent is selected */}
          {selectedCategory && selectedCategory.children && selectedCategory.children.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2 items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium mr-2">Subcategories:</span>
              <Link
                href={`/catalog?category=${selectedCategory.slug}`}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  !params.child
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All {selectedCategory.name}
              </Link>
              {selectedCategory.children.map((ch) => {
                const isChildActive = params.child === ch.slug;
                return (
                  <Link
                    key={ch.id}
                    href={`/catalog?category=${selectedCategory.slug}&child=${ch.slug}`}
                    className={`px-2.5 py-1 rounded text-xs transition ${
                      isChildActive
                        ? "bg-slate-700 text-white font-medium"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ch.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200">No products found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              There are currently no active listings matching your filters. Try selecting a different category or clearing search keywords.
            </p>
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Clear all filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((prod) => {
              const primaryImg = prod.images.find((img) => img.isPrimary) || prod.images[0];
              const priceFormatted = parseFloat(prod.pricePkr).toLocaleString();
              const sdcPriceFormatted = prod.sdcPrice ? parseFloat(prod.sdcPrice).toLocaleString() : null;

              return (
                <div
                  key={prod.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col group"
                >
                  <div className="aspect-square bg-slate-800/80 relative overflow-hidden flex items-center justify-center">
                    {primaryImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImg.url}
                        alt={primaryImg.altText || prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-slate-600" />
                    )}

                    {prod.purchaseContext === "SIGNUP" && (
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        Signup Only
                      </span>
                    )}
                    {prod.purchaseContext === "BOTH" && (
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        Signup Eligible
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{prod.categoryName || "Marketplace"}</span>
                        <span className="font-mono text-slate-500">SKU: {prod.sku}</span>
                      </div>

                      <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-emerald-400 transition">
                        <Link href={`/catalog/${prod.slug}`}>{prod.title}</Link>
                      </h3>

                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">PKR Price</div>
                        <div className="text-lg font-bold text-slate-100">
                          Rs. {priceFormatted}
                        </div>
                        {sdcPriceFormatted && (
                          <div className="text-xs font-semibold text-amber-400">
                            {sdcPriceFormatted} SDC
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/catalog/${prod.slug}`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition"
                        title="View Product Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === pagination.page;
              return (
                <Link
                  key={p}
                  href={`/catalog?page=${p}${params.category ? `&category=${params.category}` : ""}${
                    params.child ? `&child=${params.child}` : ""
                  }${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isCurrent
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
