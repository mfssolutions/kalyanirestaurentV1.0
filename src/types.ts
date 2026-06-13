export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  mrp: number;
  price: number;
  image: string;
  fallbackImage: string;
  isVeg: boolean;
  popular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface CheckoutConfig {
  platform_fee_percent: number;
  min_order_value: number;
  delivery_charge: number;
  max_delivery_km: number;
  hotel_latitude: number;
  hotel_longitude: number;
}

export interface DeliveryAddress {
  placeName: string;
  roadName: string;
  pincode: string;
  latitude: number;
  longitude: number;
  houseFloor: string;
  receiverName: string;
  contactNumber: string;
  landmark?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  platformFee: number;
  deliveryCharge: number;
  total: number;
}

export interface CheckoutSession {
  summary: CheckoutSummary;
  address: DeliveryAddress;
  distanceKm: number;
  cartItems: CartItem[];
}

export type MobileTab = "home" | "orders" | "profile" | "notifications";
