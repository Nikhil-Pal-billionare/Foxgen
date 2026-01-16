import { createClient } from "@/lib/supabaseServer";

export type Args = {
  userId: string;
  amount: number; // positive only
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

  if (data.balance < amount) {
    throw new Error("Insufficient credits");
  }

  await supabase
    .from("credits")
    .update({
      balance: data.balance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Optional audit log
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
    balance: data.balance - amount,
  };
}
