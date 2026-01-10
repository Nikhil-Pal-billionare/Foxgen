import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, reason, meta } = await req.json();

    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: amount,
      p_reason: reason ?? "usage",
      p_meta: meta ?? {},
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // ✅ ALWAYS RETURN JSON
    return NextResponse.json({
      success: true,
      deducted: amount,
    });
  } catch (err: any) {
    console.error("CREDIT DEDUCT ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
