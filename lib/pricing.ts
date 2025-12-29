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
export const PRICING = {
  INR: {
    currency: "INR",
    symbol: "₹",
    plans: {
      starter: 668,
      pro: 999,
      elite: 2649,
    },
  },
  USD: {
    currency: "USD",
    symbol: "$",
    plans: {
      starter: 9,
      pro: 12,
      elite: 30,
    },
  },
};
