import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/domain/products/service";
import {
  ShieldCheck,
  Package,
  RotateCcw,
  Store,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
  const priceFormatted = parseFloat(product.pricePkr).toLocaleString();
  const sdcPriceFormatted = product.sdcPrice ? parseFloat(product.sdcPrice).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace Catalog</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-700/50">
              {primaryImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImg.url}
                  alt={primaryImg.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-24 h-24 text-slate-600" />
              )}
            </div>

            {/* Thumbnail preview list */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.altText || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {product.categoryName || "Catalog Product"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
                  {product.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">SKU: {product.sku}</span>
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Out of stock</span>
                  )}
                </div>
              </div>

              {/* Price Block */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 font-medium">Official Price</div>
                <div className="text-3xl font-black text-slate-100 mt-0.5">
                  Rs. {priceFormatted}
                </div>
                {sdcPriceFormatted && (
                  <div className="text-sm font-semibold text-amber-400 mt-1">
                    Equivalent: {sdcPriceFormatted} SDC
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Policies & Context */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Return Policy</span>
                  </div>
                  <p className="text-slate-400">
                    {product.isReturnable
                      ? `${product.returnWindowDays}-day standard inspection window`
                      : "Non-returnable item"}
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Purchase Context</span>
                  </div>
                  <p className="text-slate-400">
                    {product.purchaseContext === "SIGNUP"
                      ? "Exclusive Signup Pack"
                      : product.purchaseContext === "BOTH"
                      ? "Regular & Signup Eligible"
                      : "Standard Marketplace Deal"}
                  </p>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-3.5 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-200">
                      {product.sellerBusinessName || "Verified SD Partner"}
                    </div>
                    {product.sellerCity && (
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3" />
                        <span>{product.sellerCity}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold">
                  APPROVED PARTNER
                </span>
              </div>
            </div>

            {/* Note regarding Phase 2 scope */}
            <div className="bg-amber-950/20 border border-amber-800/50 rounded-xl p-4 text-xs text-amber-300/90 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Phase 2 Catalog Verification:</span> This listing is actively persisted in Cloud SQL PostgreSQL. Real checkout, cart ordering, and rewards settlement will activate in subsequent development phases.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
