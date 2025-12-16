type DeductCreditsInput = {
  amount: number;
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCredits({
  amount,
  reason,
  meta,
}: DeductCreditsInput) {
  const res = await fetch("/api/credits/deduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reason, meta }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Credit deduction failed");
  }

  return data;
}
