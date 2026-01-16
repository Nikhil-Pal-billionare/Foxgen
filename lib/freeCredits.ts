import { createClient } from "@/lib/supabaseServer";

const FREE_DAILY_CREDITS = 150;

export async function ensureDailyFreeCredits(userId: string) {
  const supabase = createClient();

  /* ---------------- CHECK PAID PLAN ---------------- */
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // 🚫 Paid user → DO NOTHING
  if (subscription) {
    return;
  }

  /* ---------------- GET CREDITS ROW ---------------- */
  const { data: credits } = await supabase
    .from("credits")
    .select("balance, updated_at")
    .eq("user_id", userId)
    .single();

  if (!credits) {
    // first-time user
    await supabase.from("credits").insert({
      user_id: userId,
      balance: FREE_DAILY_CREDITS,
    });
    return;
  }

  /* ---------------- CHECK DATE ---------------- */
  const lastUpdate = new Date(credits.updated_at).toDateString();
  const today = new Date().toDateString();

  if (lastUpdate === today) {
    return; // already set today
  }

  /* ---------------- RESET FREE CREDITS ---------------- */
  await supabase.from("credits").update({
    balance: FREE_DAILY_CREDITS,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
}
