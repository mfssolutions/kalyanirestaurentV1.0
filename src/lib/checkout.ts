import { supabase } from "./supabase";
import { CheckoutConfig, CheckoutSummary, CartItem } from "../types";

const DEFAULT_CONFIG: CheckoutConfig = {
  platform_fee_percent: 2,
  min_order_value: 100,
  delivery_charge: 0,
  max_delivery_km: 3,
  hotel_latitude: 0,
  hotel_longitude: 0,
};

export async function fetchCheckoutConfig(): Promise<CheckoutConfig> {
  if (!supabase) return DEFAULT_CONFIG;

  const { data, error } = await supabase.rpc("get_checkout_config");

  if (error || !data) {
    console.warn("Failed to fetch checkout config, using defaults:", error);
    return DEFAULT_CONFIG;
  }

  const config = data as Partial<CheckoutConfig>;
  return {
    platform_fee_percent: Number(config.platform_fee_percent ?? DEFAULT_CONFIG.platform_fee_percent),
    min_order_value: Number(config.min_order_value ?? DEFAULT_CONFIG.min_order_value),
    delivery_charge: Number(config.delivery_charge ?? DEFAULT_CONFIG.delivery_charge),
    max_delivery_km: Number(config.max_delivery_km ?? DEFAULT_CONFIG.max_delivery_km),
    hotel_latitude: Number(config.hotel_latitude ?? 0),
    hotel_longitude: Number(config.hotel_longitude ?? 0),
  };
}

export function calculateSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce((acc, row) => acc + row.item.price * row.quantity, 0);
}

export function calculateCheckoutSummary(
  cartItems: CartItem[],
  config: CheckoutConfig
): CheckoutSummary {
  const subtotal = calculateSubtotal(cartItems);
  const platformFee = Math.round(subtotal * (config.platform_fee_percent / 100));
  const deliveryCharge = config.delivery_charge;
  const total = subtotal + platformFee + deliveryCharge;

  return { subtotal, platformFee, deliveryCharge, total };
}

export function isMinimumOrderMet(subtotal: number, config: CheckoutConfig): boolean {
  return subtotal >= config.min_order_value;
}
