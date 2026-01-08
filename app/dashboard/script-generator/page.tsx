"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScriptGeneratorPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const router = useRouter();

  async function generateScript() {
    if (!idea.trim()) return;

    setLoading(true);
    setScript("");

    const res = await fetch("/api/script-generator", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to generate script");
      return;
    }

    setScript(data.finalScript);
  }

  function goToVoiceover() {
    router.push(
      `/dashboard/voiceover-generator?script=${encodeURIComponent(script)}`
    );
  }

  function goToVideoGenerator() {
    router.push(
      `/dashboard/video-generator?script=${encodeURIComponent(script)}`
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Script Generator</h1>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your video idea..."
        className="w-full h-40 rounded-xl bg-white/5 p-4 outline-none"
      />

      <button
        onClick={generateScript}
        disabled={loading}
        className="px-6 py-2 bg-red-600 hover:bg-red-500 transition rounded-lg"
      >
        {loading ? "Generating..." : "Generate Script"}
      </button>

      {script && (
        <div className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap space-y-4">
          <p>{script}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={goToVoiceover}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition rounded-lg"
            >
              🎤 Generate Voiceover
            </button>

            <button
              onClick={goToVideoGenerator}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 transition rounded-lg"
            >
              🎬 Generate Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
