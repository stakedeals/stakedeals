"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, PauseCircle, ShieldAlert, Sliders } from "lucide-react";

interface Product {
  id: string;
  title: string;
  sku: string;
  pricePkr: string;
  stock: number;
  status: string;
  sdpRuleId?: string | null;
  sdcRuleId?: string | null;
}

export function ProductModerationControls({
  product,
  isAdmin,
  onActionComplete,
}: {
  product: Product;
  isAdmin: boolean;
  onActionComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [sdpAmount, setSdpAmount] = useState("50.0000");

  const handleModerate = async (status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    if (!confirm(`Are you sure you want to mark this listing as ${status}?`)) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate",
          data: {
            status,
            rejectionReason: status === "REJECTED" ? "Quality standards not met." : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to moderate product");
      onActionComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error moderating product");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSdpRule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configure_sdp_rule",
          data: {
            sdpAmount,
            isActive: true,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SDP rule");
      setShowRuleModal(false);
      onActionComplete();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error configuring SDP rule");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-[10px] text-rose-400 mr-2 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> {error}
        </span>
      )}

      {product.status !== "APPROVED" && (
        <button
          onClick={() => handleModerate("APPROVED")}
          disabled={loading}
          title="Approve Listing"
          className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}

      {product.status !== "REJECTED" && (
        <button
          onClick={() => handleModerate("REJECTED")}
          disabled={loading}
          title="Reject Listing"
          className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/80 transition"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {product.status === "APPROVED" && (
        <button
          onClick={() => handleModerate("SUSPENDED")}
          disabled={loading}
          title="Suspend Listing"
          className="p-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-400 border border-amber-800/80 transition"
        >
          <PauseCircle className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={() => setShowRuleModal(true)}
        title="Configure Product Reward Rules"
        className="p-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-400 border border-indigo-800/80 transition"
      >
        <Sliders className="w-3.5 h-3.5" />
      </button>

      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-slate-100 space-y-4">
            <h4 className="font-bold text-sm">Product SDP Reward Rule Config</h4>
            <p className="text-xs text-slate-400">
              Set the product-specific buyer SDP reward override for SKU <strong>{product.sku}</strong>.
            </p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Override SDP Amount</label>
              <input
                type="text"
                value={sdpAmount}
                onChange={(e) => setSdpAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSdpRule}
                disabled={loading}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-semibold transition"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
