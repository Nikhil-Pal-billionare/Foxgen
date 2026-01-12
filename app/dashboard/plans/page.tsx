"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    "50 free credits (one-time)",
    "Try images, videos & voiceover",
    "No credit card required",
    "Basic AI access",
  ],
  starter: [
    "1600 credits ",
    "Images, videos, voiceovers, scripts",
    "AI Cut Editor & B-Roll access",
    "Priority processing",
    "Cancel anytime",
  ],
  pro: [
    "2800 credits ",
    "Everything in Starter",
    "Faster generation speed",
    "Higher quality outputs",
    "Advanced AI tools access",
  ],
  elite: [
    "5800 credits ",
    "Everything in Pro",
    "Maximum generation limits",
    "Fastest processing speed",
    "Premium AI features",
  ],
};


export default function PlansPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      // Allow viewing plans without auth? Maybe not, per old code
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

  if (loading || !pricing) return (
     <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
     </div>
  );

  const { symbol, plans } = pricing;

  return (
    <div className="min-h-screen py-10 flex flex-col items-center justify-center space-y-12 pb-20">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
           Choose Your Creative Plan
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock the full potential of AI content creation. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1400px] px-6 items-start">

        {/* FREE */}
        <PlanCard
          title="Free"
          priceLabel={`${symbol}0`}
          
          features={FEATURES.free}
          buttonLabel="Current Plan"
          onSelect={() => handleSelectPlan("free")}
          variant="default"
        />

        {/* STARTER */}
        <PlanCard
          title="Starter"
          original={`${symbol}${plans.starter.original}`}
          priceLabel={`${symbol}${plans.starter.discounted}`}
          
          features={FEATURES.starter}
          buttonLabel="Upgrade to Starter"
          onSelect={() => handleSelectPlan("starter")}
          variant="blue"
        />

        {/* PRO */}
        <PlanCard
          title="Pro"
          isPopular
          original={`${symbol}${plans.pro.original}`}
          priceLabel={`${symbol}${plans.pro.discounted}`}
          
          features={FEATURES.pro}
          buttonLabel="Upgrade to Pro"
          onSelect={() => handleSelectPlan("pro")}
          variant="brand"
        />

        {/* ELITE */}
        <PlanCard
          title="Elite"
          original={`${symbol}${plans.elite.original}`}
          priceLabel={`${symbol}${plans.elite.discounted}`}
          
          features={FEATURES.elite}
          buttonLabel="Upgrade to Elite"
          onSelect={() => handleSelectPlan("elite")}
          variant="orange"
        />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  original,
  priceLabel,
  period,
  features,
  buttonLabel,
  onSelect,
  isPopular,
  variant = 'default'
}: {
  title: string;
  original?: string;
  priceLabel: string;
  period?: string;
  features: string[];
  buttonLabel: string;
  onSelect: () => void;
  isPopular?: boolean;
  variant?: 'default' | 'blue' | 'brand' | 'orange';
}) {

  const variants = {
    default: {
      border: "border-white/10",
      bg: "bg-[#0b0f19]",
      badge: "bg-gray-800 text-gray-300",
      button: "bg-white/10 hover:bg-white/20 text-white",
      glow: ""
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-gradient-to-b from-blue-900/10 to-[#0b0f19]",
      badge: "bg-blue-500/20 text-blue-300",
      button: "bg-blue-600 hover:bg-blue-500 text-white",
      glow: "shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]"
    },
    brand: {
      border: "border-purple-500/30",
      bg: "bg-gradient-to-b from-purple-900/40 via-[#1a103c] to-[#0b0f19]",
      badge: "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white shadow-lg shadow-purple-500/40",
      button: "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:brightness-110 text-white shadow-lg shadow-purple-500/25",
      glow: "shadow-[0_0_50px_-5px_rgba(139,92,246,0.3)] border-t-purple-500/50 scale-[1.02] z-10"
    },
    orange: {
      border: "border-orange-500/30",
      bg: "bg-gradient-to-b from-orange-900/10 to-[#0b0f19]",
      badge: "bg-orange-500/20 text-orange-300",
      button: "bg-orange-600 hover:bg-orange-500 text-white",
      glow: "shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]"
    }
  };

  const style = variants[variant];

  return (
    <div className={cn(
        "relative rounded-2xl border p-6 flex flex-col h-full bg-[#0b0f19] transition-all duration-300",
        style.border,
        style.bg,
        style.glow,
    )}>
      
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="space-y-4 mb-6 text-center">
        <h2 className="text-xl font-medium text-gray-300">{title}</h2>

        <div className="flex flex-col items-center">
          {original && (
            <span className="line-through text-gray-500 text-sm mb-1">
              {original}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white tracking-tight">
              {priceLabel}
            </span>
            {period && <span className="text-gray-500 text-sm font-medium">{period}</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-8">
        <div className="h-px w-full bg-white/5" />
        <ul className="space-y-3 text-sm text-gray-400">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <div className={cn("mt-0.5 p-0.5 rounded-full shrink-0", 
                 variant === 'default' ? "bg-gray-800 text-gray-400" : "bg-green-500/20 text-green-400"
              )}>
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <button
          onClick={onSelect}
          className={cn(
            "w-full py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
            style.button
          )}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
