import { NextResponse } from "next/server";
// ✅ Correct Import
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

// ✅ Correct Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  // 💳 Credits Logic
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

  const finalPrompt = `
Create a YouTube thumbnail background.
Aspect ratio: 16:9
Style: cinematic, high contrast, bold colors
Topic: ${prompt}
Rules: NO text, NO letters, Leave empty space for text, Subject on left, Clean background
`;

  try {
    // ✅ Model setup with Type Casting to avoid build errors
    const model = (genAI as any).getGenerativeModel({
      model: "imagen-3.0-generate-001",
    });

    // Imagen 3 ke liye generateContent use hota hai
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    
    // Imagen ka response structure check karein
    const imagePart = response.candidates?.[0]?.content?.parts?.[0];

    if (!imagePart?.inlineData) {
      throw new Error("No image data received");
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    });
  } catch (error: any) {
    console.error("Imagen Error:", error);
    return NextResponse.json(
      { error: "Generation failed: " + error.message },
      { status: 500 }
    );
  }
}
