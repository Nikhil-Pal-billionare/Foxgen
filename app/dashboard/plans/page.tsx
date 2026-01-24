"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DemoRequestModal from "@/components/DemoRequestModal";

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
    "50 free credits per day for 3 days",
    "Try images, videos & voiceovers",
    "No credit card required",
    "Basic AI access",
  ],
  starter: [
    "1600 credits",
    "Images, videos, voiceovers, scripts",
    "AI Cut Editor & B-Roll access",
    "Priority processing",
    "Cancel anytime",
  ],
  pro: [
    "2800 credits",
    "Everything in Starter",
    "Faster generation speed",
    "Higher quality outputs",
    "Advanced AI tools access",
  ],
  elite: [
    "5800 credits",
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
  const [openDemo, setOpenDemo] = useState(false);

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

  if (loading || !pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const { symbol, plans } = pricing;

  return (
    <div className="min-h-screen py-12 flex flex-col items-center justify-center space-y-12 pb-24">

      {/* HEADER */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
          Choose Your Creative Plan
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock the full power of AI content creation. Cancel anytime.
        </p>
      </div>

      {/* PLANS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1400px] px-6">

        <PlanCard
          title="Free"
          priceLabel={`${symbol}0`}
          features={FEATURES.free}
          buttonLabel="Current Plan"
          onSelect={() => handleSelectPlan("free")}
          variant="default"
        />

        <PlanCard
          title="Starter"
          original={`${symbol}${plans.starter.original}`}
          priceLabel={`${symbol}${plans.starter.discounted}`}
          features={FEATURES.starter}
          buttonLabel="Upgrade to Starter"
          onSelect={() => handleSelectPlan("starter")}
          variant="blue"
        />

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

      {/* FREE DEMO CTA */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setOpenDemo(true)}
          className="
            px-10 py-4
            rounded-2xl
            font-semibold
            text-white
            bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500
            hover:brightness-110
            shadow-xl
          "
        >
          👉 Request Free Use-Case Demo
        </button>

        <p className="text-sm text-gray-400 text-center max-w-md">
          Not sure which plan fits?  
          Get a free personalised demo before paying.
        </p>
      </div>

      {openDemo && (
        <DemoRequestModal onClose={() => setOpenDemo(false)} />
      )}
    </div>
  );
}

/* ---------------- PLAN CARD ---------------- */

function PlanCard({
  title,
  original,
  priceLabel,
  features,
  buttonLabel,
  onSelect,
  isPopular,
  variant = "default",
}: {
  title: string;
  original?: string;
  priceLabel: string;
  features: string[];
  buttonLabel: string;
  onSelect: () => void;
  isPopular?: boolean;
  variant?: "default" | "blue" | "brand" | "orange";
}) {
  const variants = {
    default: {
      border: "border-white/10",
      bg: "bg-[#0b0f19]",
      button: "bg-white/10 hover:bg-white/20",
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-gradient-to-b from-blue-900/10 to-[#0b0f19]",
      button: "bg-blue-600 hover:bg-blue-500",
    },
    brand: {
      border: "border-purple-500/30",
      bg: "bg-gradient-to-b from-purple-900/40 via-[#1a103c] to-[#0b0f19]",
      button:
        "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500",
    },
    orange: {
      border: "border-orange-500/30",
      bg: "bg-gradient-to-b from-orange-900/10 to-[#0b0f19]",
      button: "bg-orange-600 hover:bg-orange-500",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 flex flex-col bg-[#0b0f19]",
        style.border,
        style.bg
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-xs font-bold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center space-y-3 mb-6">
        <h2 className="text-xl font-medium text-gray-300">{title}</h2>

        {original && (
          <div className="line-through text-sm text-gray-500">
            {original}
          </div>
        )}

        <div className="text-4xl font-bold text-white">
          {priceLabel}
        </div>
      </div>

      <ul className="flex-1 space-y-3 text-sm text-gray-400 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-green-400 mt-1" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-white transition",
          style.button
        )}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
