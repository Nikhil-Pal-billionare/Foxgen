"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const VOICE_OPTIONS = [
  { id: "male_low", label: "Male – Low Pitch" },
  { id: "male_normal", label: "Male – Normal Pitch" },
  { id: "male_high", label: "Male – High Pitch" },
  { id: "female_low", label: "Female – Low Pitch" },
  { id: "female_normal", label: "Female – Normal Pitch" },
  { id: "female_high", label: "Female – High Pitch" },
] as const;

export default function VoiceoverGeneratorPage() {
  const params = useSearchParams();

  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState<string>("male_normal");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     AUTO-PASTE SCRIPT
  ========================= */
  useEffect(() => {
    const script = params.get("script");
    if (script) setText(script);
  }, [params]);

  /* =========================
     GENERATE VOICEOVER
  ========================= */
  const generateVoiceover = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl("");

    const res = await fetch("/api/voiceover-generator", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId, // 🔥 SEND VOICE OPTION
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Voiceover failed");
      return;
    }

    // ✅ SAFE BASE64 → AUDIO
    const byteCharacters = Uint8Array.from(
      atob(data.audioBase64),
      (c) => c.charCodeAt(0)
    );

    const blob = new Blob([byteCharacters], { type: data.mimeType });
    setAudioUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="space-y-6 max-w-4xl text-white">
      <h1 className="text-2xl font-semibold">AI Voiceover Generator</h1>

      {/* SCRIPT INPUT */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or write your script here..."
        className="w-full h-40 rounded-xl bg-white/5 p-4 border border-white/10"
      />

      {/* VOICE SELECTOR */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Voice</label>

        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="
            w-full rounded-lg
            bg-black border border-gray-700
            px-3 py-2
            outline-none
          "
        >
          {VOICE_OPTIONS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={generateVoiceover}
        disabled={loading}
        className="
          px-6 py-2
          bg-blue-600 hover:bg-blue-700
          rounded-lg font-semibold
          disabled:opacity-60
        "
      >
        {loading ? "Generating..." : "Generate Voiceover"}
      </button>

      {/* AUDIO OUTPUT */}
      {audioUrl && (
        <audio controls className="w-full mt-4">
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
