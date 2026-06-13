import React from "react";
import { CartItem } from "../types";
import { X, Plus, Minus, ShoppingBag, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { ElegantImage } from "./ElegantImage";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, action: "increment" | "decrement") => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.item.price * item.quantity, 0);
  const originalTotal = cartItems.reduce((acc, item) => acc + item.item.mrp * item.quantity, 0);
  const savings = originalTotal - subtotal;
  const deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 39;
  const gst = Math.round(subtotal * 0.05); // 5% GST for restaurant food online delivery
  const grandTotal = subtotal === 0 ? 0 : subtotal + deliveryFee + gst;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 relative border-l border-emerald-900/10">
          
          {/* Header */}
          <div className="p-6 bg-brand-green text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-yellow" />
              <h2 className="text-lg font-bold tracking-wide font-display">My Cart</h2>
              <span className="bg-brand-yellow text-brand-green font-black text-xs px-2.5 py-0.5 rounded-full shadow">
                {cartItems.reduce((acc, current) => acc + current.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-colors"
              title="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-brand-green/5 rounded-full text-brand-green animate-pulse">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-neutral-800 text-lg font-display">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Browse our authentic categories and add delicious bites from Kalyani Kitchen to your order!
                </p>
                <button
                  onClick={onClose}
                  className="bg-brand-green text-white text-xs font-black uppercase py-2.5 px-6 rounded-lg hover:bg-brand-green/90 transition-colors"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-neutral-50 hover:bg-neutral-100/50 rounded-xl border border-neutral-100 transition-colors items-center"
                  >
                    {/* Square Mini Img */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm border border-neutral-200">
                      <ElegantImage
                        src={item.image}
                        fallback={item.fallbackImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-brand-green tracking-wider bg-brand-green/5 px-2 py-0.5 rounded uppercase font-display">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate mt-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-brand-green font-extrabold">
                          ₹{item.price}
                        </span>
                        <span className="text-[10px] text-neutral-400 line-through">
                          ₹{item.mrp}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector Section */}
                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.id, "decrement")}
                          className="px-2 py-1 hover:bg-neutral-100 text-neutral-600 active:bg-neutral-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                         </button>
                        <span className="px-2.5 text-xs text-neutral-800 font-extrabold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, "increment")}
                          className="px-2 py-1 hover:bg-neutral-100 text-neutral-600 active:bg-neutral-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Footer & Info Panel */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 rounded-t-xl space-y-4">
              <div className="space-y-2 text-xs">
                
                {/* Original Item sum */}
                <div className="flex justify-between text-neutral-500">
                  <span>Item Total (MRP)</span>
                  <span className="line-through">₹{originalTotal}</span>
                </div>

                {/* Instant discount savings */}
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Chef Instant Savings</span>
                  <span>- ₹{savings}</span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between font-bold text-neutral-800 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-brand-green font-extrabold uppercase">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {/* Delivery offer incentive slider bar */}
                {subtotal < 300 && (
                  <div className="bg-amber-50 rounded p-2 border border-amber-200/50 animate-pulse">
                    <p className="text-[10px] text-amber-800 leading-normal">
                      💡 Add items worth <strong className="font-extrabold text-amber-900">₹{300 - subtotal}</strong> more to get <strong className="font-extrabold text-amber-950">FREE DELIVERY!</strong>
                    </p>
                  </div>
                )}

                {/* Taxes GST */}
                <div className="flex justify-between text-neutral-500">
                  <span>Taxes & charges (GST 5%)</span>
                  <span>₹{gst}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between font-extrabold text-neutral-900 text-base pt-2 border-t border-neutral-300">
                  <span>To Pay</span>
                  <span className="text-brand-green text-lg font-display">₹{grandTotal}</span>
                </div>
              </div>

              {/* Security checkout promise */}
              <div className="flex items-center gap-2 text-[10px] text-brand-green font-medium bg-brand-green/3 p-2.5 rounded-lg border border-brand-green/10">
                <ShieldCheck className="w-4 h-4 shrink-0 text-brand-green" />
                <span>Kalyani Kitchen safety cooks with fresh, premium-grade ingredients. Assured contact-less dispatch.</span>
              </div>

              {/* Checkout Button: High contrast CTA */}
              <button
                onClick={onCheckout}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-extrabold text-sm uppercase py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                Place Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
