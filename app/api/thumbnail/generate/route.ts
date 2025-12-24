import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt required" },
      { status: 400 }
    );
  }

  // ✅ Fetch credits
  const { data: wallet } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet || wallet.balance < CREDIT_COSTS.THUMBNAIL_GENERATION) {
    return NextResponse.json(
      { error: "Insufficient credits" },
      { status: 402 }
    );
  }

  // ✅ Deduct credits (SERVER SIDE)
  await supabase
    .from("credits")
    .update({
      balance: wallet.balance - CREDIT_COSTS.THUMBNAIL_GENERATION,
    })
    .eq("user_id", user.id);

  // 🔥 Call AI service here
  const images = [
    "/placeholder-thumbnail.png",
    "/placeholder-thumbnail.png",
    "/placeholder-thumbnail.png",
    "/placeholder-thumbnail.png",
  ];

  return NextResponse.json({ images });
}
