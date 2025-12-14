export async function deductCredits(amount: number, reason: string) {
  const res = await fetch("/api/credits/deduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reason }),
  });

  if (!res.ok) {
    throw new Error("Failed to deduct credits");
  }

  const data = await res.json();
  return data;
}
