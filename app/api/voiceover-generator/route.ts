import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";
const textToSpeech = require("@google-cloud/text-to-speech");

const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: Request) {
  const supabase = createClient();

  // 🔐 AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  // 💳 CREDITS
  if (process.env.TESTER_MODE !== "true") {
    const minutes = Math.ceil(text.split(" ").length / 150);

    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: minutes * CREDIT_COSTS.voice_per_minute,
      p_reason: "voiceover_generation",
      p_meta: { minutes },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // 🔊 GOOGLE TTS
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", name: "en-US-Wavenet-D" },
    audioConfig: { audioEncoding: "MP3" },
  });

  return NextResponse.json({
    audioBase64: response.audioContent?.toString("base64"),
    mimeType: "audio/mpeg",
  });
}
