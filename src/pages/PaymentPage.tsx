import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { CheckoutSession } from "../types";
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from "../lib/razorpay";
import { insertOrder } from "../lib/supabase";

interface PaymentPageProps {
  session: CheckoutSession;
  userEmail: string;
  onBack: () => void;
  onSuccess: (orderId: string, total: number) => void;
}

export function PaymentPage({ session, userEmail, onBack, onSuccess }: PaymentPageProps) {
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePay = async () => {
    setErrorMsg("");
    setPaying(true);

    const amountInPaise = Math.round(session.summary.total * 100);
    const orderResult = await createRazorpayOrder(amountInPaise);

    if (!orderResult.success || !orderResult.orderId) {
      setPaying(false);
      setErrorMsg(orderResult.message || "Unable to start payment.");
      return;
    }

    const checkoutResult = await openRazorpayCheckout({
      amountInPaise,
      orderId: orderResult.orderId,
      customerName: session.address.receiverName,
      customerEmail: userEmail,
      customerPhone: session.address.contactNumber,
      description: `Kalyani Kitchen order • ${session.cartItems.length} item(s)`,
      onDismiss: () => setPaying(false),
      onSuccess: async (response) => {
        const verified = await verifyRazorpayPayment(response);
        if (!verified.success) {
          setPaying(false);
          setErrorMsg(verified.message || "Payment verification failed.");
          return;
        }

        const orderId = "KK-" + Math.floor(Math.random() * 900000 + 100000);
        const addressString = [
          session.address.houseFloor,
          session.address.placeName,
          session.address.landmark ? `(Landmark: ${session.address.landmark})` : "",
          `Contact: ${session.address.receiverName} ${session.address.contactNumber}`,
        ]
          .filter(Boolean)
          .join(", ");

        await insertOrder({
          id: orderId,
          total: session.summary.total,
          items: session.cartItems,
          userEmail,
          address: addressString,
          paymentId: response.razorpay_payment_id,
        });

        setPaying(false);
        onSuccess(orderId, session.summary.total);
      },
    });

    if (!checkoutResult.success) {
      setPaying(false);
      setErrorMsg(checkoutResult.message || "Unable to open payment gateway.");
    }
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
          <h1 className="text-xl font-black text-neutral-900 font-display">Payment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-xl border border-red-200 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
          <h2 className="font-black text-neutral-900">Order Summary</h2>
          <div className="text-sm space-y-2 text-neutral-600">
            <div className="flex justify-between">
              <span>Sub total</span>
              <span className="font-bold text-neutral-900">₹{session.summary.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span className="font-bold text-neutral-900">₹{session.summary.platformFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-bold text-brand-green uppercase">Free</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200 text-base">
              <span className="font-black text-neutral-900">Total payable</span>
              <span className="font-black text-brand-green">₹{session.summary.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <h2 className="font-black text-neutral-900 mb-3">Deliver to</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            {session.address.houseFloor}, {session.address.placeName}
            {session.address.landmark ? ` (${session.address.landmark})` : ""}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {session.address.receiverName} • {session.address.contactNumber}
          </p>
          <p className="text-xs text-brand-green font-bold mt-2">
            Road distance: {session.distanceKm.toFixed(1)} km
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <h2 className="font-black text-neutral-900 mb-4">Accepted via Razorpay</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold">
              <Smartphone className="w-4 h-4 text-brand-green" /> UPI
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold">
              <CreditCard className="w-4 h-4 text-brand-green" /> Cards
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-green" /> Netbanking
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-semibold">
              <Wallet className="w-4 h-4 text-brand-green" /> Wallets
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-black py-4 rounded-2xl uppercase tracking-wide cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          Pay ₹{session.summary.total} Securely
        </button>
      </div>
    </div>
  );
}
