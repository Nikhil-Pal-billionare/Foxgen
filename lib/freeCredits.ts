import { createClient } from "@/lib/supabaseServer";

const FREE_DAILY_CREDITS = 50;
const TRIAL_DAYS = 3;

export async function ensureDailyFreeCredits(userId: string) {
  const supabase = createClient();

  /* ---------------- PAID PLAN CHECK ---------------- */
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (subscription) return;

  /* ---------------- FETCH CREDITS ---------------- */
  const { data: credits } = await supabase
    .from("credits")
    .select("balance, created_at, last_free_reset")
    .eq("user_id", userId)
    .maybeSingle();

  /* ---------------- FIRST TIME USER ---------------- */
  if (!credits) {
    await supabase.from("credits").insert({
      user_id: userId,
      balance: FREE_DAILY_CREDITS,
      last_free_reset: new Date().toISOString(),
    });
    return;
  }

  /* ---------------- TRIAL CHECK ---------------- */
  const trialStart = new Date(credits.created_at);
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays >= TRIAL_DAYS) {
    // ❌ No daily free credits after trial
    return;
  }

  /* ---------------- DAILY RESET ---------------- */
  const lastReset = credits.last_free_reset
    ? new Date(credits.last_free_reset).toDateString()
    : null;

  const todayStr = today.toDateString();

  if (lastReset === todayStr) return;

  await supabase
    .from("credits")
    .update({
      balance: FREE_DAILY_CREDITS,
      last_free_reset: today.toISOString(),
    })
    .eq("user_id", userId);
}
