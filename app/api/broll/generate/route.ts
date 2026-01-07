import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { GoogleGenAI } from "@google/genai";

const BROLL_GENERATION_COST = 10;
const TESTER_MODE = true; // 🔥 unlimited credits for testing

/* ----------------------------------
   GEMINI CLIENT (@google/genai)
----------------------------------- */
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

  // ✅ Strip markdown code fences if Gemini adds them
  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String);
  } catch (err) {
    console.error("Gemini JSON parse failed:", text);
    return [];
  }
}

/* ----------------------------------
   POST /api/broll/generate
----------------------------------- */
export async function POST(req: Request) {
  try {
    const supabase = createClient();

    /* ---------------------------
       1. AUTH
    ---------------------------- */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ---------------------------
       2. INPUT
    ---------------------------- */
    const { description } = await req.json();

    if (!description || description.trim().length < 3) {
      return NextResponse.json(
        { error: "Description required" },
        { status: 400 }
      );
    }

    /* ---------------------------
       3. FETCH USER CREDITS (REAL TABLE)
    ---------------------------- */
    const { data: creditRow, error: creditError } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!creditRow || creditError) {
      return NextResponse.json(
        { error: "Credits row not found" },
        { status: 400 }
      );
    }

    const currentCredits = creditRow.balance;

    /* ---------------------------
       4. CREDIT CHECK
    ---------------------------- */
    if (!TESTER_MODE && currentCredits < BROLL_GENERATION_COST) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    /* ---------------------------
       5. DEDUCT CREDITS
    ---------------------------- */
    if (!TESTER_MODE) {
      await supabase
        .from("credits")
        .update({
          balance: currentCredits - BROLL_GENERATION_COST,
        })
        .eq("user_id", user.id);
    }

    /* ---------------------------
       6. GEMINI → SCENES
    ---------------------------- */
    const scenes = await generateScenesWithGemini(description);

    if (!scenes.length) {
      return NextResponse.json(
        { error: "Failed to generate scenes" },
        { status: 500 }
      );
    }

    /* ---------------------------
       7. FETCH PEXELS VIDEOS
    ---------------------------- */
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
      return NextResponse.json(
        { error: "No footage found" },
        { status: 404 }
      );
    }

    /* ---------------------------
       8. SAVE TO LATER FOOTAGES
    ---------------------------- */
    await supabase.from("later_footages").insert({
      user_id: user.id,
      title: description,
      clips,
      source: TESTER_MODE
        ? "pexels + gemini (tester)"
        : "pexels + gemini",
    });

    /* ---------------------------
       9. RESPONSE
    ---------------------------- */
    return NextResponse.json({
      success: true,
      testerMode: TESTER_MODE,
      creditsUsed: TESTER_MODE ? 0 : BROLL_GENERATION_COST,
      creditsRemaining: currentCredits,
      scenes,
      clips,
    });
  } catch (err) {
    console.error("BROLL GENERATE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
