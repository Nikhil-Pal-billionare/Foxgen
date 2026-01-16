import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { detectCuts } from "@/lib/cutDetector";
import { NextResponse } from "next/server";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";

export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 🔥 ENSURE DAILY FREE CREDITS
  await ensureDailyFreeCredits(user.id);

  const { words, durationSeconds } = await req.json();

  if (!Array.isArray(words) || !durationSeconds) {
    return NextResponse.json(
      { error: "Invalid input for cut analysis" },
      { status: 400 }
    );
  }

  /* =========================
     CREDIT DEDUCTION
  ========================= */
  const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
  const creditsToDeduct = minutes * CREDIT_COSTS.AI_CUT_PER_MINUTE;

  const { error } = await supabase.rpc("deduct_credits", {
    p_user_id: user.id,
    p_amount: creditsToDeduct,
    p_reason: "ai_cut_editor",
    p_meta: { minutes },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  /* =========================
     CUT DETECTION
  ========================= */
  const cuts = detectCuts(words);

  return NextResponse.json({
    cuts,
    creditsUsed: creditsToDeduct,
  });
}
