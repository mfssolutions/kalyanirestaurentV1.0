import { supabase } from "./supabase";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayPaymentResponse) => void) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export async function createRazorpayOrder(amountInPaise: number): Promise<{
  success: boolean;
  orderId?: string;
  message?: string;
}> {
  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount: amountInPaise, currency: "INR" },
  });

  if (error) {
    return { success: false, message: error.message || "Unable to create payment order." };
  }

  const orderId = (data as { orderId?: string })?.orderId;
  if (!orderId) {
    return { success: false, message: "Invalid payment order response." };
  }

  return { success: true, orderId };
}

export async function openRazorpayCheckout(params: {
  amountInPaise: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onDismiss?: () => void;
}): Promise<{ success: boolean; message?: string }> {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    return { success: false, message: "Razorpay key is not configured." };
  }

  try {
    await loadRazorpayScript();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Razorpay.";
    return { success: false, message };
  }

  if (!window.Razorpay) {
    return { success: false, message: "Razorpay SDK unavailable." };
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount: params.amountInPaise,
    currency: "INR",
    name: "Kalyani Kitchen",
    description: params.description,
    order_id: params.orderId,
    prefill: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone,
    },
    theme: { color: "#1b4332" },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
    handler: params.onSuccess,
    modal: {
      ondismiss: params.onDismiss,
    },
  });

  razorpay.open();
  return { success: true };
}

export async function verifyRazorpayPayment(payload: RazorpayPaymentResponse): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
    body: payload,
  });

  if (error) {
    return { success: false, message: error.message || "Payment verification failed." };
  }

  if (!(data as { verified?: boolean })?.verified) {
    return { success: false, message: "Payment could not be verified." };
  }

  return { success: true };
}
