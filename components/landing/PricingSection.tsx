"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Plan = {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "plan-1",
    name: "Starter",
    price: "₹668",
    originalPrice: "₹1099",
    features: [
      "Up to 80 image generation/mo",
      "Up to 160min video generation/mo",
      "Up to 400 min TTS",
      "Up to 400 min script generation",
      "Up to 50 thumbnail generations",
    ],
  },
  {
    id: "plan-2",
    name: "Pro",
    price: "₹999",
    originalPrice: "₹1699",
    features: [
      "Up to 160 image generation/mo",
      "Up to 320min video generation/mo",
      "Up to 800 min TTS",
      "Up to 800 min script generation",
      "Up to 100 thumbnail generations",
    ],
  },
  {
    id: "plan-3",
    name: "Elite",
    price: "₹2649",
    originalPrice: "₹3899",
    features: [
      "Up to 320 image generation/mo",
      "Up to 640min video generation/mo",
      "Up to 1400 min TTS",
      "Up to 1400 min script generation",
      "Up to 200 thumbnail generations",
    ],
  },
];

interface PricingSectionProps {
  onSelectPlanAction: (planId: string) => void;
  loadingPlanId?: string | null;
}

export function PricingSection({ onSelectPlanAction, loadingPlanId }: PricingSectionProps) {
  return (
    <section className="py-12 w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Choose Your Early Access Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 bg-[#121212] border-gray-800 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                <span className="text-3xl font-extrabold text-[#C1272D]">{plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              onClick={() => onSelectPlanAction(plan.id)}
              disabled={!!loadingPlanId}
              className={`w-full ${
                plan.id === "plan-2" ? "bg-[#C1272D] hover:bg-[#A02025]" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {loadingPlanId === plan.id ? "Processing..." : "Select Plan"}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto p-6 bg-[#1A1A1A] rounded-xl border border-gray-800">
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-white">Note:</span> Your plan includes a flexible credit balance that can be used across all AI tools.
          Usage varies depending on the type of content you create.
        </p>
      </div>
    </section>
  );
}
