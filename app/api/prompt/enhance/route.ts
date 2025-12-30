import { NextResponse } from "next/server";
import { enhanceWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const enhancedPrompt = await enhanceWithGemini(prompt);

    return NextResponse.json({
      enhancedPrompt,
    });
  } catch (err: any) {
    console.error("PROMPT ENHANCE ERROR:", err);

    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
