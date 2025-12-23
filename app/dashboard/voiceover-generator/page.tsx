"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VoiceoverGeneratorPage() {
  const params = useSearchParams();
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AUTO-PASTE SCRIPT
  useEffect(() => {
    const script = params.get("script");
    if (script) setText(script);
  }, [params]);

  const generateVoiceover = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl("");

    const res = await fetch("/api/voiceover-generator", {
      method: "POST",
      credentials: "include", // 🔥 REQUIRED
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">AI Voiceover Generator</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-40 rounded-xl bg-white/5 p-4"
      />

      <button
        onClick={generateVoiceover}
        disabled={loading}
        className="px-6 py-2 bg-red-600 rounded-lg"
      >
        {loading ? "Generating..." : "Generate Voiceover"}
      </button>

      {audioUrl && (
        <audio controls className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
