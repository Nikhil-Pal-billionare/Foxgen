import { createClient } from "@/lib/supabaseServer";

const FREE_DAILY_CREDITS = 50;
const TRIAL_DAYS = 3;

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
    .select("balance, updated_at, created_at")
    .eq("user_id", userId)
    .single();

  // 🆕 First-time free user → start trial
  if (!credits) {
    await supabase.from("credits").insert({
      user_id: userId,
      balance: FREE_DAILY_CREDITS,
    });
    return;
  }

  /* ---------------- CHECK TRIAL DAYS ---------------- */
  const trialStart = new Date(credits.created_at);
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // ❌ Trial expired (3 days over)
  if (diffDays >= TRIAL_DAYS) {
    await supabase.from("credits").update({
      balance: 0,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
    return;
  }

  /* ---------------- DAILY RESET CHECK ---------------- */
  const lastUpdate = new Date(credits.updated_at).toDateString();
  const todayStr = today.toDateString();

  if (lastUpdate === todayStr) {
    return; // already reset today
  }

  /* ---------------- RESET DAILY FREE CREDITS ---------------- */
  await supabase.from("credits").update({
    balance: FREE_DAILY_CREDITS,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
}
