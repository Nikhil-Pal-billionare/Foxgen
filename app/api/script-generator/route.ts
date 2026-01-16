import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { GoogleGenAI } from "@google/genai";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = createClient();

  // 🔐 AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 🔥 ENSURE DAILY FREE CREDITS
  await ensureDailyFreeCredits(user.id);

  const { idea } = await req.json();
  if (!idea) {
    return NextResponse.json({ error: "Idea is required" }, { status: 400 });
  }

  // 💳 CREDITS (SERVER SIDE ONLY)
  if (process.env.TESTER_MODE !== "true") {
    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.script,
      p_reason: "script_generation",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // 🤖 GEMINI
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: idea }] }],
  });

  return NextResponse.json({
    finalScript: response.text,
  });
}
