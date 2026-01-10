
export type PlanId = "starter" | "pro" | "elite";

export type PlanPricing = {
  original: number;
  discounted: number;
};

export type RegionPricing = {
  currency: "INR" | "USD";
  symbol: string;
  plans: Record<PlanId, PlanPricing>;
};

export const PRICING: Record<"INR" | "USD", RegionPricing> = {
  INR: {
    currency: "INR",
    symbol: "₹",
    plans: {
      starter: { original: 1149, discounted: 999 },
      pro: { original: 1999, discounted: 1699 },
      elite: { original: 3999, discounted: 3499 },
    },
  },
  USD: {
    currency: "USD",
    symbol: "$",
    plans: {
      starter: { original: 13, discounted:11 },
      pro: { original: 23, discounted: 19 },
      elite: { original: 45, discounted: 39 },
    },
  },
};

export function applyDiscount(
  amount: number,
  type: "flat" | "percent",
  value: number
) {
  if (type === "percent") {
    return Math.max(amount - (amount * value) / 100, 0);
  }
  return Math.max(amount - value, 0);
}
