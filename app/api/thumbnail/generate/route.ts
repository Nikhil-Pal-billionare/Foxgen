import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
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
      { error: "Prompt required" },
      { status: 400 }
    );
  }

  // 💳 Credits
  const { data: wallet } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet || wallet.balance < CREDIT_COSTS.THUMBNAIL_GENERATION) {
    return NextResponse.json(
      { error: "Insufficient credits" },
      { status: 402 }
    );
  }

  await supabase
    .from("credits")
    .update({
      balance: wallet.balance - CREDIT_COSTS.THUMBNAIL_GENERATION,
    })
    .eq("user_id", user.id);

  // 🎯 IMPORTANT: NO TEXT IN IMAGE
  const finalPrompt = `
Create a YouTube thumbnail background.
Aspect ratio: 16:9
Style: cinematic, high contrast, bold colors

Topic:
${prompt}

Rules:
- NO text, NO letters
- Leave empty space for text
- Subject on left
- Clean background
`;

  const model = genAI.getGenerativeModel({
    model: "imagen-3.0-generate-001",
  });

  const result = await model.generateContent(finalPrompt);

  const imagePart =
    result.response.candidates?.[0]?.content?.parts?.[0];

  if (!imagePart?.inlineData) {
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
  });
}
