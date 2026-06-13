import { CartItem } from "../types";

const CART_STORAGE_KEY = "kk_cart_v1";
const CHECKOUT_SESSION_KEY = "kk_checkout_session_v1";

export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function saveCheckoutSession(session: unknown): void {
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
}

export function loadCheckoutSession<T>(): T | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearCheckoutSession(): void {
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
}
