import { createClient } from "@/lib/supabaseServer";

type Args = {
  userId: string;
  amount: number;
  reason: string;
  meta?: Record<string, any>;
};

export async function deductCreditsServer({
  userId,
  amount,
  reason,
  meta = {},
}: Args) {
  const supabase = createClient();

  const { error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_meta: meta,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
