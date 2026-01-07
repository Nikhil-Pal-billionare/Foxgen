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
              text: `You are an expert video producer and innovative director.
Your goal is to turn the user's idea into a structured video plan that uses **Pexels stock footage**.
The video is NOT AI-generated; it is assembled from real stock clips.

User Input: "${input}"

Instructions:
1. **Script**: Write a compelling voiceover script.
2. **Visuals**: Break the script into scenes. For each scene, define a "footageType".
3. **Pexels Optimization**: The "footageType" must be a high-quality search query for Pexels.
   - ❌ Bad: "Growth", "Thinking", "Future" (Abstract)
   - ✅ Good: "Time lapse of growing plant", "Man rubbing chin looking at computer", "Futuristic city skyline drone shot" (Visual)
   - Use concrete nouns and verbs.
4. **Output Format**: Return strictly JSON with "finalScript" and "scenes" array.`,
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
