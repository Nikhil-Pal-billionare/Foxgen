import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { generateImage } from "@/lib/gemini";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureDailyFreeCredits(user.id);

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const imageBase64 = await generateImage(prompt);

    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.TEXT_TO_IMAGE,
      p_reason: "image_generation",
      p_meta: { prompt },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
    });
  } catch (err: any) {
    console.error("IMAGE API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
