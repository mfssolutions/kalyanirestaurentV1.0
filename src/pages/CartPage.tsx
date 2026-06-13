import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { CartItem, CheckoutConfig } from "../types";
import { ElegantImage } from "../components/ElegantImage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { fetchCheckoutConfig, calculateCheckoutSummary, isMinimumOrderMet } from "../lib/checkout";

interface CartPageProps {
  cartItems: CartItem[];
  onBack: () => void;
  onAddMore: () => void;
  onSelectAddress: () => void;
  onUpdateQuantity: (itemId: string, action: "increment" | "decrement") => void;
  onRemoveItem: (itemId: string) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export function CartPage({
  cartItems,
  onBack,
  onAddMore,
  onSelectAddress,
  onUpdateQuantity,
  onRemoveItem,
  isLoggedIn,
  onRequireLogin,
}: CartPageProps) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCheckoutConfig().then(setConfig);
  }, []);

  const summary = config ? calculateCheckoutSummary(cartItems, config) : null;

  const handleSelectAddress = () => {
    setErrorMsg("");
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (!config || !summary) return;
    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }
    if (!isMinimumOrderMet(summary.subtotal, config)) {
      setErrorMsg(`Minimum order value is ₹${config.min_order_value}. Add more items to continue.`);
      return;
    }
    onSelectAddress();
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-32 lg:pb-10">
      <div className="bg-white border-b border-neutral-200 sticky top-20 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-xl font-black text-neutral-900 font-display">My Cart</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-xl border border-red-200 font-semibold">
            {errorMsg}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-sm">
            <p className="text-4xl mb-3">🛒</p>
            <h2 className="text-lg font-black text-neutral-900">Your cart is empty</h2>
            <p className="text-sm text-neutral-500 mt-2">Add delicious Kerala dishes to get started.</p>
            <button
              type="button"
              onClick={onAddMore}
              className="mt-6 bg-brand-green text-white font-bold px-6 py-3 rounded-xl cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {cartItems.map(({ item, quantity }) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <ElegantImage
                      src={item.image}
                      fallback={item.fallbackImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-neutral-900 text-base leading-tight">{item.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.description}</p>
                    <p className="text-sm font-black text-neutral-900 mt-2">₹{item.price * quantity}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, "decrement")}
                      className="px-3 py-2 hover:bg-neutral-100 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-black">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, "increment")}
                      className="px-3 py-2 hover:bg-neutral-100 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget({ id: item.id, name: item.name })}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onAddMore}
              className="text-orange-600 font-bold text-sm flex items-center gap-1 cursor-pointer"
            >
              + Add more items
            </button>

            {summary && config && (
              <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Sub total</span>
                  <span className="font-bold text-neutral-900">₹{summary.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Platform fee ({config.platform_fee_percent}%)</span>
                  <span className="font-bold text-neutral-900">₹{summary.platformFee}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-brand-green uppercase">Free</span>
                </div>
                <div className="border-t border-dashed border-neutral-300 pt-3 flex justify-between items-center">
                  <span className="font-black text-neutral-900">Total</span>
                  <span className="font-black text-xl text-neutral-900">₹{summary.total}</span>
                </div>
                {summary.subtotal < config.min_order_value && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    Minimum order value is ₹{config.min_order_value}. Add ₹{config.min_order_value - summary.subtotal} more.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSelectAddress}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wide cursor-pointer"
                >
                  Select Address
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove item?"
        message={`Remove "${removeTarget?.name}" from your cart?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeTarget) onRemoveItem(removeTarget.id);
          setRemoveTarget(null);
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
