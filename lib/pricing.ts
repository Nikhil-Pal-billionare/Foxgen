/* =========================
   DISCOUNT HELPER
========================= */
export function applyDiscount(
  amount: number,
  type: "percent" | "flat",
  value: number
) {
  if (type === "percent") {
    return Math.max(amount - (amount * value) / 100, 0);
  }
  return Math.max(amount - value, 0);
}

/* =========================
   PRICING (SOURCE OF TRUTH)
========================= */
export const PRICING = {
  INR: {
    currency: "INR",
    symbol: "₹",
    plans: {
      starter: {
        original: 1099,
        discounted: 668,
      },
      pro: {
        original: 1699,
        discounted: 999,
      },
      elite: {
        original: 3899,
        discounted: 2649,
      },
    },
  },

  USD: {
    currency: "USD",
    symbol: "$",
    plans: {
      starter: {
        original: 16,
        discounted: 11,
      },
      pro: {
        original: 34,
        discounted: 29,
      },
      elite: {
        original: 44,
        discounted: 39,
      },
    },
  },
} as const;

