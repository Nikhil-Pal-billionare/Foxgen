import { createClient } from "@/lib/supabaseServer";

export type Args = {
  userId: string;
  amount: number;
  reason?: string;
  meta?: Record<string, any>;
};

export async function deductCreditsServer({
  userId,
  amount,
  reason,
  meta,
}: Args) {
  if (amount <= 0) {
    throw new Error("Deduction amount must be positive");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Credits row not found");
  }

  // 🔥 FIX: Convert to number explicitly
  const balance = Number(data.balance);

  if (isNaN(balance)) {
    throw new Error("Invalid balance value");
  }

  if (balance < amount) {
    throw new Error("Insufficient credits");
  }

  const newBalance = balance - amount;

  const { error: updateError } = await supabase
    .from("credits")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error("Failed to update credits");
  }

  if (reason) {
    await supabase.from("credit_logs").insert({
      user_id: userId,
      amount: -amount,
      reason,
      meta,
    });
  }

  return {
    success: true,
    balance: newBalance,
  };
}