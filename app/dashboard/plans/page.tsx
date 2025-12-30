"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Pricing = {
  currency: string;
  symbol: string;
  plans: Record<
    "starter" | "pro" | "elite",
    {
      original: number;
      discounted: number;
    }
  >;
};

const FEATURES = {
  free: [
    "2 image generations",
    "2 min video generation",
    "1 script generation",
    "1 voiceover (TTS)",
  ],
  starter: [
    "Up to 80 image generation/mo",
    "Up to 160 min video generation/mo",
    "Up to 400 min TTS",
    "Up to 400 min script generation",
    "Up to 50 thumbnail generations",
  ],
  pro: [
    "Up to 160 image generation/mo",
    "Up to 320 min video generation/mo",
    "Up to 800 min TTS",
    "Up to 800 min script generation",
    "Up to 100 thumbnail generations",
  ],
  elite: [
    "Up to 320 image generation/mo",
    "Up to 640 min video generation/mo",
    "Up to 1400 min TTS",
    "Up to 1400 min script generation",
    "Up to 200 thumbnail generations",
  ],
};

export default function PlansPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/sign-in");
      setLoading(false);
    });

    fetch("/api/pricing")
      .then((r) => r.json())
      .then(setPricing)
      .catch(() => {});
  }, [supabase, router]);

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    router.push(`/payment?plan=${planId}`);
  };

  if (loading || !pricing) return null;

  const { symbol, plans } = pricing;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="grid md:grid-cols-4 gap-8 w-full max-w-7xl px-4 items-stretch">

        {/* FREE */}
        <PlanCard
          title="Free"
          priceLabel={`${symbol}0/mo`}
          features={FEATURES.free}
          buttonLabel="Start Free"
          onSelect={() => handleSelectPlan("free")}
        />

        {/* STARTER */}
        <PlanCard
          title="Starter"
          original={`${symbol}${plans.starter.original}`}
          priceLabel={`${symbol}${plans.starter.discounted}/mo`}
          features={FEATURES.starter}
          buttonLabel="Select Plan"
          onSelect={() => handleSelectPlan("starter")}
        />

        {/* PRO */}
        <PlanCard
          title="Pro"
          original={`${symbol}${plans.pro.original}`}
          priceLabel={`${symbol}${plans.pro.discounted}/mo`}
          features={FEATURES.pro}
          buttonLabel="Select Plan"
          onSelect={() => handleSelectPlan("pro")}
        />

        {/* ELITE */}
        <PlanCard
          title="Elite"
          original={`${symbol}${plans.elite.original}`}
          priceLabel={`${symbol}${plans.elite.discounted}/mo`}
          features={FEATURES.elite}
          buttonLabel="Select Plan"
          onSelect={() => handleSelectPlan("elite")}
        />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  original,
  priceLabel,
  features,
  buttonLabel,
  onSelect,
}: any) {
  return (
    <div className="rounded-2xl border border-[#1F1F1F] p-6 flex flex-col justify-between text-center">
      <div className="space-y-6 text-left">
        <h2 className="text-2xl font-bold text-center">{title}</h2>

        <div className="text-center">
          {original && (
            <span className="line-through text-gray-500 mr-2">
              {original}
            </span>
          )}
          <span className="text-4xl font-extrabold text-[#C1272D]">
            {priceLabel}
          </span>
        </div>

        <ul className="text-gray-300 text-sm space-y-2">
          {features.map((f: string, i: number) => (
            <li key={i}>✔ {f}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Button
          onClick={onSelect}
          className="w-full bg-[#C1272D] hover:bg-[#A02025]"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
