"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* =========================
   TYPES
========================= */
type PricingData = {
  currency: string;
  symbol: string;
  plans: Record<string, { original: number; discounted: number }>;
};

interface PricingSectionProps {
  pricing: PricingData;
  onSelectPlanAction: (planId: string) => void;
  loadingPlanId?: string;
}

/* =========================
   PLAN METADATA (NO PRICES)
========================= */
const PLAN_META = [
  {
    id: "starter",
    name: "Starter",
    features: [
      "Up to 80 image generation/mo",
      "Up to 160 min video generation/mo",
      "Up to 400 min TTS",
      "Up to 400 min script generation",
      "Up to 50 thumbnail generations",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    highlight: true,
    features: [
      "Up to 160 image generation/mo",
      "Up to 320 min video generation/mo",
      "Up to 800 min TTS",
      "Up to 800 min script generation",
      "Up to 100 thumbnail generations",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    features: [
      "Up to 320 image generation/mo",
      "Up to 640 min video generation/mo",
      "Up to 1400 min TTS",
      "Up to 1400 min script generation",
      "Up to 200 thumbnail generations",
    ],
  },
];

/* =========================
   COMPONENT
========================= */
export function PricingSection({
  pricing,
  onSelectPlanAction,
  loadingPlanId,
}: PricingSectionProps) {
  return (
    <section className="py-12 w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">
        Choose Your Early Access Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLAN_META.map((plan) => {
          const planData = pricing.plans[plan.id];
          const price = planData?.discounted;
          const originalPrice = planData?.original;

          return (
            <Card
              key={plan.id}
              className="p-6 bg-[#121212] border-gray-800 flex flex-col"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">
                  {plan.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-2">
                  {originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {pricing.symbol}
                      {originalPrice}
                    </span>
                  )}

                  <span className="text-3xl font-extrabold text-[#C1272D]">
                    {pricing.symbol}
                    {price}
                    <span className="text-sm text-gray-400 font-normal">
                      /mo
                    </span>
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start text-sm text-gray-300"
                  >
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => onSelectPlanAction(plan.id)}
                disabled={!!loadingPlanId}
                className={`w-full ${
                  plan.highlight
                    ? "bg-[#C1272D] hover:bg-[#A02025]"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {loadingPlanId === plan.id
                  ? "Processing..."
                  : "Select Plan"}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-12 text-center max-w-2xl mx-auto p-6 bg-[#1A1A1A] rounded-xl border border-gray-800">
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-white">Note:</span> Your plan
          includes a flexible credit balance that can be used across all AI
          tools. Usage varies depending on the type of content you create.
        </p>
      </div>
    </section>
  );
}


