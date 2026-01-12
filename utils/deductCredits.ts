import { createClient } from "@/lib/supabaseServer";

type DeductCreditsArgs = {
  userId: string;
  amount: number;
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCredits({
  userId,
  amount,
  reason,
  meta = {},
}: DeductCreditsArgs) {
  const supabase = createClient();

  /* 1️⃣ Fetch current balance */
  const { data, error: fetchError } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (fetchError || !data) {
    throw new Error("Credits record not found");
  }

  if (data.balance < amount) {
    throw new Error("Insufficient credits");
  }

  const newBalance = data.balance - amount;

  /* 2️⃣ Update balance */
  const { error: updateError } = await supabase
    .from("credits")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error("Failed to update credits");
  }

  /* 3️⃣ Insert credit log (schema matches screenshot) */
  const { error: logError } = await supabase
    .from("credit_logs")
    .insert({
      amount: amount, // keep POSITIVE (as per your logs)
      reason,
      meta,
    });

  if (logError) {
    throw new Error("Failed to insert credit log");
  }

  return { success: true, balance: newBalance };
}
