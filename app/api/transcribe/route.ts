import { NextResponse } from "next/server";
import { transcribeAudio, pollTranscript } from "@/lib/assembly";

export async function POST(req: Request) {
  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: "audioUrl is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Start transcription
    const id = await transcribeAudio(audioUrl);

    // 2️⃣ Poll until completed
    const raw = await pollTranscript(id);

    /* =========================
       NORMALIZE RESPONSE
    ========================= */
    let text = "";
    let words: any[] = [];

    // Case 1: direct text + words
    if (raw.text && Array.isArray(raw.words)) {
      text = raw.text;
      words = raw.words;
    }

    // Case 2: words only
    else if (Array.isArray(raw.words)) {
      words = raw.words;
      text = words.map((w) => w.text).join(" ");
    }

    // Case 3: utterances
    else if (Array.isArray(raw.utterances)) {
      text = raw.utterances.map((u: { text: any; }) => u.text).join(" ");
      words = raw.utterances.flatMap((u: { words: any; }) => u.words || []);
    }

    if (!text || words.length === 0) {
      return NextResponse.json(
        { error: "Failed to extract transcript text" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text,
      words,
      audio_duration: raw.audio_duration || raw.duration,
    });
  } catch (err: any) {
    console.error("TRANSCRIBE ERROR:", err);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
