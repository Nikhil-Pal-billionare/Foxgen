type DeductCreditsArgs = {
  amount: number;
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCredits({
  amount,
  reason,
  meta = {},
}: DeductCreditsArgs) {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL
      : "";

  const res = await fetch(`${baseUrl}/api/credits/deduct`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      reason,
      meta,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to deduct credits");
  }

  return data;
}
