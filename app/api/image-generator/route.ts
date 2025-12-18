import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    // 🔐 Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 🔐 Deduct credits (server-side only)
    const { error: creditError } = await supabase.rpc(
      "deduct_credits",
      {
        amount: CREDIT_COSTS.TEXT_TO_IMAGE,
        reason: "Gemini Image Generation",
        meta: { prompt },
      }
    );

    if (creditError) {
      return NextResponse.json(
        { error: creditError.message },
        { status: 402 }
      );
    }

    // 🎨 Gemini Image Generation
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [prompt],
    });

    const images =
      response.candidates?.[0]?.content?.parts
        ?.filter((p: any) => p.inline_data)
        ?.map(
          (p: any) =>
            `data:image/png;base64,${p.inline_data.data}`
        );

    if (!images || images.length === 0) {
      throw new Error("No image generated");
    }

    return NextResponse.json({ images });

  } catch (err: any) {
    console.error("Gemini image error:", err);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
