"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScriptGeneratorPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const router = useRouter();

  const generateScript = async () => {
    if (!idea.trim()) return;

    setLoading(true);
    setScript("");

    const res = await fetch("/api/script-generator", {
      method: "POST",
      credentials: "include", // 🔥 REQUIRED
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
  };

  const goToVoiceover = () => {
    router.push(
      `/dashboard/voiceover-generator?script=${encodeURIComponent(script)}`
    );
  };

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
        className="px-6 py-2 bg-red-600 rounded-lg"
      >
        {loading ? "Generating..." : "Generate Script"}
      </button>

      {script && (
        <div className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap">
          {script}

          <button
            onClick={goToVoiceover}
            className="mt-4 block px-4 py-2 bg-blue-600 rounded-lg"
          >
            Generate Voiceover →
          </button>
        </div>
      )}
    </div>
  );
}
