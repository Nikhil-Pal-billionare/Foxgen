export type DeductCreditsArgs = {
  amount: number;
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCredits({
  amount,
  reason,
  meta = {},
}: DeductCreditsArgs) {
  const res = await fetch("/api/credits/deduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      reason,
      meta,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to deduct credits");
  }

  return data;
}
