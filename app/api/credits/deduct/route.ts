import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

console.log("SERVER USER:", user);


  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
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
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
