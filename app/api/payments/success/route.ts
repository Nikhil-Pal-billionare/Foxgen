import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { PLAN_CREDITS, PlanId } from "@/lib/planCredits";

export async function POST(req: Request) {
  const supabase = createClient();

  const { userId, planId } = await req.json();

  if (!userId || !planId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: PLAN_CREDITS[planId as PlanId],
    p_reason: "plan_purchase_paid",
    p_meta: { plan: planId },
  });

  return NextResponse.json({ success: true });
}
