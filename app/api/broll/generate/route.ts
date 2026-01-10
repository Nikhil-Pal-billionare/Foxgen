import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* ----------------------------------
   GEMINI → SCENE GENERATION
----------------------------------- */
async function generateScenesWithGemini(
  description: string
): Promise<string[]> {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are a professional video editor.

Convert the following user request into 4 short, cinematic B-roll search queries.

Rules:
- Each scene max 6–8 words
- Visual descriptions only
- No emotions
- No explanations
- Output JSON array ONLY

User request:
"${description}"
            `,
          },
        ],
      },
    ],
  });

  let text = response.text || "";
  text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String);
  } catch {
    return [];
  }
}

/* ----------------------------------
   POST /api/broll/generate
----------------------------------- */
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

    const userId: string = user.id;

    /* ---------------- INPUT ---------------- */
    const { description } = await req.json();

    if (!description || description.trim().length < 3) {
      return NextResponse.json(
        { error: "Description required" },
        { status: 400 }
      );
    }

    /* ---------------- CREDIT COST ---------------- */
    const cost = CREDIT_COSTS.BROLL_GENERATION_COST;

    /* ---------------- DEDUCT CREDITS ---------------- */
    await deductCreditsServer({
      userId,
      amount: cost,
      reason: "broll_generation",
      meta: { description },
    });

    /* ---------------- GEMINI → SCENES ---------------- */
    const scenes = await generateScenesWithGemini(description);

    if (!scenes.length) {
      throw new Error("Scene generation failed");
    }

    /* ---------------- PEXELS FETCH ---------------- */
    const clips: any[] = [];

    for (const scene of scenes.slice(0, 4)) {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(
          scene
        )}&per_page=1`,
        {
          headers: {
            Authorization: process.env.PEXELS_API_KEY!,
          },
        }
      );

      const data = await res.json();
      if (data?.videos?.length) {
        clips.push(data.videos[0]);
      }
    }

    if (!clips.length) {
      throw new Error("No footage found");
    }

    /* ---------------- SAVE RESULT ---------------- */
    await supabase.from("later_footages").insert({
      user_id: userId,
      title: description,
      clips,
      source: "pexels + gemini",
    });

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      success: true,
      creditsUsed: cost,
      scenes,
      clips,
    });

  } catch (err: any) {
    console.error("🔥 BROLL GENERATION ERROR:", err);

    /* ---------------- REFUND ON FAILURE ---------------- */
    if (err?.message !== "Unauthorized") {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await deductCreditsServer({
            userId: user.id,
            amount: -CREDIT_COSTS.BROLL_GENERATION_COST,
            reason: "refund_broll_failed",
          });
        }
      } catch (refundErr) {
        console.error("⚠️ Refund failed:", refundErr);
      }
    }

    return NextResponse.json(
      { error: "B-roll generation failed" },
      { status: 500 }
    );
  }
}
