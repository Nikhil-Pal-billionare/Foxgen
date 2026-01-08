"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Film, Loader2 } from "lucide-react";

type Scene = {
  id: number;
  text: string;
  footageQuery: string;
  videos: any[];
  selectedVideo?: string;
};

export default function VideoGeneratorPage() {
  const params = useSearchParams();
  const scriptFromUrl = params.get("script");

  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (scriptFromUrl) {
      setScript(scriptFromUrl);
      setStep(2);
    }
  }, [scriptFromUrl]);

  async function generatePlan() {
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
        .slice(0, 80),
      videos: [],
    }));

    setScenes(generated);
    setStep(3);
  }

  async function fetchFootage() {
    try {
      setLoading(true);
      const updated = [...scenes];

      for (let i = 0; i < updated.length; i++) {
        const res = await fetch("/api/pexels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: updated[i].footageQuery,
            perPage: 3,
          }),
        });

        const videos = await res.json();
        updated[i].videos = videos;
        updated[i].selectedVideo =
          videos?.[0]?.video_files?.[0]?.link;
      }

      setScenes(updated);
    } catch {
      setError("Failed to fetch footage");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-white">
      <div className="flex items-center gap-3 mb-8">
        <Film className="text-red-600" />
        <h1 className="text-4xl font-black">AI Video Generator</h1>
      </div>

      {step < 3 && (
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-48 p-6 bg-black/50 rounded-xl"
        />
      )}

      {step < 3 && (
        <button
          onClick={generatePlan}
          className="mt-6 w-full py-4 bg-red-600 rounded-xl font-bold"
        >
          <Sparkles size={18} className="inline mr-2" />
          Generate Video Plan
        </button>
      )}

      {step === 3 && (
        <>
          <button
            onClick={fetchFootage}
            className="mb-8 px-6 py-3 bg-white text-black rounded-xl font-bold"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Generate Video"
            )}
          </button>

          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="mb-10 p-6 bg-white/5 rounded-xl"
            >
              <p className="italic mb-4">“{scene.text}”</p>

              {scene.selectedVideo ? (
                <video
                  src={scene.selectedVideo}
                  controls
                  className="w-full rounded-xl"
                />
              ) : (
                <p className="text-gray-400">
                  No footage yet
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 bg-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
