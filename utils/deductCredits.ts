type DeductCreditsArgs = {
  userId?: string;
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
    body: JSON.stringify({ amount, reason, meta }),
  });

  // ✅ SAFELY HANDLE EMPTY RESPONSE
  let data: any = {};
  const text = await res.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from credit API");
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || "Failed to deduct credits");
  }

  return data || { success: true };
}
