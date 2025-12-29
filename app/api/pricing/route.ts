import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PRICING } from "@/lib/pricing";
import { applyDiscount } from "@/lib/pricing";

export async function GET() {
  const country = headers().get("cf-ipcountry");

  // 1️⃣ Pick region pricing
  const regionPricing =
    country === "IN" ? PRICING.INR : PRICING.USD;

  // 2️⃣ Apply discount (example: AVT100 = ₹100 / $5)
  const discount =
    country === "IN"
      ? { type: "flat" as const, value: 100 }
      : { type: "flat" as const, value: 5 };

  const discountedPlans = Object.fromEntries(
    Object.entries(regionPricing.plans).map(([plan, price]) => [
      plan,
      applyDiscount(price, discount.type, discount.value),
    ])
  );

  return NextResponse.json({
    country: country ?? "UNKNOWN",
    currency: regionPricing.currency,
    symbol: regionPricing.symbol,
    plans: discountedPlans,
    originalPlans: regionPricing.plans,
  });
}
