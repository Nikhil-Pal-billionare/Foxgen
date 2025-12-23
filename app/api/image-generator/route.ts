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
    const { prompt, aspectRatio = "1:1", quality = "standard" } =
      await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    /* ---------------- CREDIT COST ---------------- */
    const cost = CREDIT_COSTS.TEXT_TO_IMAGE;

    /* ---------------- DEDUCT CREDITS ---------------- */
    const creditResult = await deductCredits({
      userId: user.id,
      amount: cost,
      reason: "image_generation",
    } as any);

    if (!creditResult.success) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    /* ---------------- GEMINI IMAGE CALL ---------------- */
    const response = await genAI.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt,
      config: {
        aspectRatio,
      },
    });

    const imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBase64) {
      throw new Error("Image generation failed");
    }

    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
    });

  } catch (err: any) {
    console.error("🔥 Image generator error:", err);

    /* ---------------- REFUND ON FAILURE ---------------- */
    await deductCredits({
      userId: (await createClient().auth.getUser()).data.user?.id!,
      amount: -CREDIT_COSTS.TEXT_TO_IMAGE,
      reason: "refund_image_failed",
    } as any);

    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
