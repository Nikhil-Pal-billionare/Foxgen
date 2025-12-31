import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    /* ---------------- AUTH ---------------- */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------------- INPUT ---------------- */
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    /* ---------------- CREDIT COST ---------------- */
    const cost = CREDIT_COSTS.THUMBNAIL_GENERATION;

    /* ---------------- DEDUCT CREDITS ---------------- */
    const creditResult = await deductCredits({
      userId: user.id,
      amount: cost,
      reason: "thumbnail_generation",
    } as any);

    if (!creditResult.success) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    /* ---------------- GEMINI IMAGE CALL (SAME AS IMAGE GEN) ---------------- */
    const response = await genAI.models.generateImages({
      model: "imagen-4.0-generate-001", // ✅ SAME MODEL AS WORKING IMAGE GEN
      prompt,                            // ✅ USER PROMPT AS-IS
      config: {
        aspectRatio: "16:9",             // 🔥 ONLY DIFFERENCE
        numberOfImages: 1,
      },
    });

    const imageBase64 =
      response.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBase64) {
      throw new Error("Thumbnail generation failed");
    }

    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
    });

  } catch (err: any) {
    console.error("🔥 Thumbnail generator error:", err);

    /* ---------------- REFUND ON FAILURE ---------------- */
    await deductCredits({
      userId: (await createClient().auth.getUser()).data.user?.id!,
      amount: -CREDIT_COSTS.THUMBNAIL_GENERATION,
      reason: "refund_thumbnail_failed",
    } as any);

    return NextResponse.json(
      { error: "Thumbnail generation failed" },
      { status: 500 }
    );
  }
}
