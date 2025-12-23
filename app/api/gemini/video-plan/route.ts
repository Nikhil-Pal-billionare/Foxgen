import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabaseServer";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    console.log("▶️ Video-plan API called");

    /* ---------------- AUTH CHECK ---------------- */
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
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    /* ---------------- CREDIT DEDUCTION ---------------- */
    const creditResult = await deductCredits({
      userId: user.id,
      amount: CREDIT_COSTS.video_plan, // e.g. 52
      reason: "video_plan",
    } as any);

    if (!creditResult.success) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    /* ---------------- GEMINI CALL ---------------- */
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI video planner.
From the user input: "${input}", generate a final script and logical scenes.
Return ONLY valid JSON.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            finalScript: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sceneText: { type: "string" },
                  footageType: { type: "string" },
                },
                required: ["sceneText", "footageType"],
              },
            },
          },
          required: ["finalScript", "scenes"],
        },
      },
    });

    const result =
      typeof response.text === "string"
        ? JSON.parse(response.text)
        : response.text;

    console.log("✅ Video plan generated");

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("🔥 Video-plan error:", err);

    /* -------- OPTIONAL REFUND ON FAILURE -------- */
    // This prevents users losing credits if Gemini fails
    if (err?.message) {
      await deductCredits({
        userId: (await createClient().auth.getUser()).data.user?.id!,
        amount: -CREDIT_COSTS.video_plan,
        reason: "refund_video_plan_failed",
      } as any);
    }

    return NextResponse.json(
      { error: "Video planning failed" },
      { status: 500 }
    );
  }
}
