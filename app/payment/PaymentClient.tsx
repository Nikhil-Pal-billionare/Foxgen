"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import FoxgenLogo from "@/components/branding/FoxgenLogo";

type Pricing = {
  currency: string;
  symbol: string;
  plans: Record<
    "starter" | "pro" | "elite",
    { original: number; discounted: number }
  >;
};

export default function PaymentClient() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get("plan") as "starter" | "pro" | "elite";

  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.plans && data.plans[planId]) {
          const price = data.plans[planId].discounted;
          setPricing(data);
          setBasePrice(price);
          setFinalPrice(price);
        }
      })
      .catch((err) => console.error("Failed to fetch pricing", err));
  }, [planId]);

  const handlePayment = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!pricing || !planId) {
      setError("Invalid plan configuration.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create Order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          planId,
          discountCode: promoCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Handle Free/Promo (100% off)
      if (data.free) {
        router.push("/dashboard?upgrade=success");
        return;
      }

      // 3. Handle Razorpay Payment
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh.");
      }

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.currency,
        name: "Foxgen AI",
        description: `Upgrade to ${data.planName}`,
        order_id: data.order.id,
        prefill: {
          email: email,
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async function (response: any) {
          try {
            // 4. Verify Payment
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              router.push("/dashboard?payment=success");
            } else {
              setError(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            setError("Payment verification encountered an error.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!pricing) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="w-full max-w-md bg-[#121212] border border-gray-800 rounded-xl p-8 space-y-6 text-white">
        <div className="text-center">
          <FoxgenLogo size={80} />
          <h1 className="text-2xl font-bold mt-4">Complete Payment</h1>
        </div>

        <p className="text-center text-lg">
          Plan: <b className="capitalize">{planId}</b>
        </p>

        <p className="text-center text-2xl font-bold text-[#3B82F6]">
          {pricing.symbol}
          {finalPrice}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Promo Code (Optional)</label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          disabled={loading}
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </main>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
