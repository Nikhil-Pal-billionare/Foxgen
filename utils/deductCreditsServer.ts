import { createClient } from "@/lib/supabaseServer";

type Args = {
  userId: string;
  amount: number; // +ve = deduct, -ve = refund
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCreditsServer({
  userId,
  amount,
}: Args) {
  const supabase = createClient();

  /* ---------------- FETCH CURRENT BALANCE ---------------- */
  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Credits row not found");
  }

  const newBalance = data.balance - amount;

  if (newBalance < 0) {
    throw new Error("Insufficient credits");
  }

  /* ---------------- UPDATE BALANCE ---------------- */
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

  return {
    success: true,
    balance: newBalance,
  };
}
