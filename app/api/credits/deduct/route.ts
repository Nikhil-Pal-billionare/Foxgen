import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SERVER USER:", user);

  // 🔐 Auth guard (DO NOT REMOVE)
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { amount, reason, meta } = await req.json();

  // 🧪 TESTER MODE (SAFE SHORT-CIRCUIT)
  if (process.env.TESTER_MODE === "true") {
    console.log("🧪 TESTER MODE ENABLED — skipping credit deduction");
    return NextResponse.json({ success: true });
  }

  // 💳 REAL CREDIT DEDUCTION (PRODUCTION)
  const { error } = await supabase.rpc("deduct_credits", {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: reason ?? "usage",
    p_meta: meta ?? {},
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
