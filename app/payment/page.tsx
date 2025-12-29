"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import FoxgenLogo from "@/components/branding/FoxgenLogo";

type Pricing = {
  currency: string;
  symbol: string;
  plans: Record<string, number>;
};

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();

  const planId = params.get("plan"); // starter | pro | elite

  const [email, setEmail] = useState("");
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     LOAD PRICING
  ========================= */
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then(setPricing)
      .catch(() => setError("Failed to load pricing"));
  }, []);

  if (!planId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Invalid plan selected
      </div>
    );
  }

  /* =========================
     PAY
  ========================= */
  async function handlePayment() {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      const { order, key_id, planName } = data;

      await new Promise((resolve, reject) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => reject();
        document.body.appendChild(script);
      });

      // @ts-ignore
      const rzp = new window.Razorpay({
        key: key_id,
        order_id: order.id,
        name: `Foxgen – ${planName}`,
        description: "Early access subscription",
        prefill: { email },
        handler: async () => {
          router.push("/dashboard");
        },
        theme: { color: "#C1272D" },
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#121212] border border-gray-800 rounded-xl p-8 space-y-6">
        <div className="text-center">
          <FoxgenLogo size={80} />
          <h1 className="text-2xl font-bold mt-4">Complete Payment</h1>
          <p className="text-gray-400 text-sm">
            Secure checkout for early access
          </p>
        </div>

        {pricing && (
          <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Selected Plan</p>
            <p className="text-xl font-bold capitalize">{planId}</p>
            <p className="text-2xl font-extrabold text-[#C1272D] mt-2">
              {pricing.symbol}
              {pricing.plans[planId]}
              <span className="text-sm text-gray-400 font-normal"> /mo</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full rounded-md bg-black border border-gray-700 px-3 py-2 outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="
            w-full bg-red-600 hover:bg-red-700
            disabled:bg-red-600/40
            font-semibold py-3 rounded-md
          "
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Payments are securely processed by Razorpay
        </p>
      </div>
    </main>
  );
}
