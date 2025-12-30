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

  return NextResponse.json({
    currency: region.currency,
    symbol: region.symbol,
    plans: {
      starter: {
        original: region.plans.starter.original,
        discounted: applyDiscount(
          region.plans.starter.original,
          discount.type,
          discount.value
        ),
      },
      pro: {
        original: region.plans.pro.original,
        discounted: applyDiscount(
          region.plans.pro.original,
          discount.type,
          discount.value
        ),
      },
      elite: {
        original: region.plans.elite.original,
        discounted: applyDiscount(
          region.plans.elite.original,
          discount.type,
          discount.value
        ),
      },
    },
  });
}
