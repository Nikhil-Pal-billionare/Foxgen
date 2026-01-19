export type PlanId = "starter" | "pro" | "elite";

export const PLAN_CREDITS: Record<PlanId, number> = {
  starter: 1600, // ₹999 / $11
  pro: 2800,     // ₹1699 / $19
  elite: 5700,   // ₹3499 / $39
};
