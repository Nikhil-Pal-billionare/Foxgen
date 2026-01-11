export type PlanId = "starter" | "pro" | "elite";

export const PLAN_CREDITS: Record<PlanId, number> = {
  starter: 1600, // ₹999 / $11
  pro: 2800,     // ₹1699 / $19
  elite: 6000,   // ₹3499 / $39
};
