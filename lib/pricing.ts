
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
      starter: { original: 1099, discounted: 668 },
      pro: { original: 1999, discounted: 999 },
      elite: { original: 3999, discounted: 2649 },
    },
  },
  USD: {
    currency: "USD",
    symbol: "$",
    plans: {
      starter: { original: 11, discounted: 6 },
      pro: { original: 34, discounted: 29 },
      elite: { original: 44, discounted: 39 },
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
