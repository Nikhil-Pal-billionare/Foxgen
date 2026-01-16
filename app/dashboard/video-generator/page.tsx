"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Film, Loader2 } from "lucide-react";

type Scene = {
  id: number;
  text: string;
  footageQuery: string;
};

export default function VideoGeneratorPage() {
  const params = useSearchParams();
  const scriptFromUrl = params.get("script");

  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔑 IMPORTANT: step 5 added
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [error, setError] = useState("");
  const [finalVideo, setFinalVideo] = useState<string | null>(null);

  /* ---------------- PREFILL SCRIPT ---------------- */
  useEffect(() => {
    if (scriptFromUrl) {
      setScript(scriptFromUrl);
      setStep(2);
    }
  }, [scriptFromUrl]);

  /* ---------------- STEP 1 → 3 ---------------- */
  function generatePlan() {
    if (!script.trim()) return;

    const lines = script
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const generated: Scene[] = lines.map((line, i) => ({
      id: i,
      text: line,
      footageQuery: line
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .toLowerCase()
        .slice(0, 120),
    }));

    setScenes(generated);
    setStep(3);
  }

  /* ---------------- GENERATE VIDEO ---------------- */
  async function generateVideo() {
    try {
      setLoading(true);
      setError("");
      setStep(4);

      const res = await fetch("/api/gemini/video-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          scenes: scenes.map((s) => ({
            sceneText: s.text,
            footageQuery: s.footageQuery,
          })),
        }),
      });

      const text = await res.text();
      if (!text) throw new Error("Empty server response");

      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data?.error || "Video generation failed");
      }

      if (!data.videoUrl) {
        throw new Error("Video URL missing in response");
      }

      console.log("🎬 VIDEO URL:", data.videoUrl);

      setFinalVideo(data.videoUrl);
      setStep(5); // ✅ THIS FIXES THE UI

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-white">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Film className="text-blue-600" />
        <h1 className="text-4xl font-black">AI Video Generator</h1>
      </div>

      {/* SCRIPT INPUT */}
      {step < 3 && (
        <>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your script here (one line = one scene)"
            className="w-full h-48 p-6 bg-black/50 rounded-xl"
          />

          <button
            onClick={generatePlan}
            className="mt-6 w-full py-4 bg-blue-600 rounded-xl font-bold"
          >
            <Sparkles size={18} className="inline mr-2" />
            Generate Video Plan
          </button>
        </>
      )}

      {/* SCENE REVIEW */}
      {step === 3 && (
        <>
          <button
            onClick={generateVideo}
            className="mb-8 px-6 py-3 bg-white text-black rounded-xl font-bold"
          >
            Generate AI Video (Veo)
          </button>

          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="mb-6 p-6 bg-white/5 rounded-xl"
            >
              <p className="italic">Scene {scene.id + 1}</p>
              <p className="mt-2 text-gray-300">
                “{scene.text}”
              </p>
            </div>
          ))}
        </>
      )}

      {/* LOADING */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="animate-spin w-10 h-10" />
          <p className="text-gray-300">
            Generating cinematic AI video… this may take a few minutes
          </p>
        </div>
      )}

      {/* FINAL VIDEO */}
      {step === 5 && finalVideo && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">🎬 Final Video</h2>

          <video
            src={finalVideo}
            controls
            className="w-full rounded-xl"
          />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
