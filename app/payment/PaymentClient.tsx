"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        const price = data.plans[planId].discounted;
        setPricing(data);
        setBasePrice(price);
        setFinalPrice(price);
      });
  }, [planId]);

  if (!pricing) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#121212] border border-gray-800 rounded-xl p-8 space-y-6 text-white">
        <div className="text-center">
          <FoxgenLogo size={80} />
          <h1 className="text-2xl font-bold mt-4">Complete Payment</h1>
        </div>

        <p className="text-center text-lg">
          Plan: <b className="capitalize">{planId}</b>
        </p>

        <p className="text-center text-2xl font-bold text-[#C1272D]">
          {pricing.symbol}{finalPrice}
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-red-600 py-3 rounded font-semibold"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </main>
  );
}
