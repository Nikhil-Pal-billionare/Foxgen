import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PRICING } from "@/lib/pricing";
import { applyDiscount } from "@/lib/pricing";

export async function GET() {
  const country = headers().get("cf-ipcountry");
  const region = country === "IN" ? PRICING.INR : PRICING.USD;

  const discount =
    country === "IN"
      ? { type: "flat" as const, value: 100 }
      : { type: "flat" as const, value: 5 };

  function getOriginal(plan: any): number {
    return typeof plan === "number" ? plan : plan.original;
  }

  return NextResponse.json({
    currency: region.currency,
    symbol: region.symbol,
    plans: {
      starter: {
        original: getOriginal(region.plans.starter),
        discounted: applyDiscount(
          getOriginal(region.plans.starter),
          discount.type,
          discount.value
        ),
      },
      pro: {
        original: getOriginal(region.plans.pro),
        discounted: applyDiscount(
          getOriginal(region.plans.pro),
          discount.type,
          discount.value
        ),
      },
      elite: {
        original: getOriginal(region.plans.elite),
        discounted: applyDiscount(
          getOriginal(region.plans.elite),
          discount.type,
          discount.value
        ),
      },
    },
  });
}
