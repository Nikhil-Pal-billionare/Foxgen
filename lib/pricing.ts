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
