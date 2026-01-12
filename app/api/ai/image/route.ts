import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { generateImage } from "@/lib/gemini";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

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

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Generate image first */
    const imageBase64 = await generateImage(prompt);
    if (!imageBase64) {
      throw new Error("Image generation failed");
    }

    /* 2️⃣ Deduct credits AFTER success */
    await deductCredits({
      userId: user.id,
      amount: CREDIT_COSTS.TEXT_TO_IMAGE,
      reason: "image_generation",
      meta: { source: "dashboard" },
    });

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
