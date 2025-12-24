import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createClient();

  const { email, password, referralCode, referralType } =
    await req.json();

  // 1️⃣ Create user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message },
      { status: 400 }
    );
  }

  const userId = data.user.id;

  // 2️⃣ Referral tracking (🔥 IMPORTANT)
  await supabase.from("referrals").insert({
    user_id: userId,
    source_type: referralType ?? "direct",
    source_code: referralCode ?? null,
  });

  return NextResponse.json({ success: true });
}
