import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient();

/* =========================
   VOICE PRESETS
========================= */
const VOICES = {
  male_low: {
    name: "en-US-Wavenet-D",
    gender: "MALE" as const,
    pitch: -4,
  },
  male_normal: {
    name: "en-US-Wavenet-D",
    gender: "MALE" as const,
    pitch: 0,
  },
  male_high: {
    name: "en-US-Wavenet-D",
    gender: "MALE" as const,
    pitch: 4,
  },
  female_low: {
    name: "en-US-Wavenet-F",
    gender: "FEMALE" as const,
    pitch: -4,
  },
  female_normal: {
    name: "en-US-Wavenet-F",
    gender: "FEMALE" as const,
    pitch: 0,
  },
  female_high: {
    name: "en-US-Wavenet-F",
    gender: "FEMALE" as const,
    pitch: 4,
  },
} as const;

type VoiceKey = keyof typeof VOICES;

/* =========================
   REQUEST BODY TYPE
========================= */
type VoiceRequestBody = {
  text: string;
  voiceId?: VoiceKey;
};

/* =========================
   SAFE TEXT CHUNKER
   (≤ 4500 bytes)
========================= */
function chunkText(text: string, maxBytes = 4500): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const word of text.split(" ")) {
    const test = current ? `${current} ${word}` : word;

    if (Buffer.byteLength(test, "utf8") > maxBytes) {
      chunks.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function POST(req: Request) {
  const supabase = createClient();

  /* =========================
     AUTH
  ========================= */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* =========================
     PARSE + VALIDATE INPUT
  ========================= */
  const body = (await req.json()) as Partial<VoiceRequestBody>;

  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  const selectedVoice: VoiceKey =
    body.voiceId && body.voiceId in VOICES
      ? body.voiceId
      : "male_normal";

  const voiceConfig = VOICES[selectedVoice];

  /* =========================
     CREDITS
  ========================= */
  if (process.env.TESTER_MODE !== "true") {
    const minutes = Math.ceil(body.text.split(" ").length / 150);

    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: minutes * CREDIT_COSTS.voice_per_minute,
      p_reason: "voiceover_generation",
      p_meta: {
        minutes,
        voice: selectedVoice,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  /* =========================
     GOOGLE TTS (CHUNKED)
  ========================= */
  try {
    const chunks = chunkText(body.text);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const [response] = await client.synthesizeSpeech({
        input: { text: chunk },
        voice: {
          languageCode: "en-US",
          name: voiceConfig.name,
          ssmlGender: voiceConfig.gender,
        },
        audioConfig: {
          audioEncoding: "MP3",
          pitch: voiceConfig.pitch,
        },
      });

      if (!response.audioContent) {
        throw new Error("Empty audio content from TTS");
      }

      audioBuffers.push(Buffer.from(response.audioContent));
    }

    // 🔥 Merge chunks → single MP3
    const finalAudio = Buffer.concat(audioBuffers);

    return NextResponse.json({
      audioBase64: finalAudio.toString("base64"),
      mimeType: "audio/mpeg",
      voiceUsed: selectedVoice,
    });
  } catch (err) {
    console.error("TTS ERROR:", err);
    return NextResponse.json(
      { error: "Voiceover generation failed" },
      { status: 500 }
    );
  }
}
