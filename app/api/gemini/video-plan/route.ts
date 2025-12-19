import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Toggle Gemini usage safely
 * false = use mock (current state)
 * true  = real Gemini (when infra works)
 */
const USE_GEMINI = false;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    console.log("▶️ Video-plan API called");

    const { input } = await req.json();
    console.log("📥 Input:", input);

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    /* =========================
       MOCK MODE (SAFE)
    ========================= */
    if (!USE_GEMINI) {
      console.log("🧪 Using MOCK Gemini response");

      return NextResponse.json({
        finalScript:
          "Artificial Intelligence is transforming industries worldwide. From automation to creativity, AI is shaping the future.",
        scenes: [
          {
            sceneText: "AI transforming industries",
            footageType: "artificial intelligence technology",
          },
          {
            sceneText: "Automation powered by AI",
            footageType: "robot automation factory",
          },
          {
            sceneText: "Future shaped by AI",
            footageType: "future technology abstract",
          },
        ],
      });
    }

    /* =========================
       REAL GEMINI MODE
    ========================= */
    if (!genAI) {
      throw new Error("Gemini API key missing");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    });

    const prompt = `
You are an AI video planner.

Return ONLY valid JSON (no markdown):

{
  "finalScript": "string",
  "scenes": [
    { "sceneText": "string", "footageType": "string" }
  ]
}

User input:
${input}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("🔥 Video-plan API error:", err?.message || err);
    return NextResponse.json(
      { error: "Video planning failed" },
      { status: 500 }
    );
  }
}
