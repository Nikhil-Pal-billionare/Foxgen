"use client";

import { useState } from "react";
import { fetchPexelsVideos, PexelsVideo } from "@/lib/pexels";

/* ---------- Types ---------- */
type Scene = {
  id: number;
  text: string;
  footageType: string;
  videos: PexelsVideo[];
  selectedVideo?: string;
};

export default function VideoGeneratorPage() {
  const [userInput, setUserInput] = useState("");
  const [script, setScript] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState("");

  /* ---------- Generate via Gemini ---------- */
  const generateScenes = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Ask Gemini (server-side)
      const res = await fetch("/api/gemini/video-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });

      const geminiPlan = await res.json();

      setScript(geminiPlan.finalScript);

      // 2️⃣ Use Gemini footage types → Pexels
      const generatedScenes: Scene[] = [];

      for (let i = 0; i < geminiPlan.scenes.length; i++) {
        const scene = geminiPlan.scenes[i];

        const videos = await fetchPexelsVideos(scene.footageType);

        generatedScenes.push({
          id: i,
          text: scene.sceneText,
          footageType: scene.footageType,
          videos,
          selectedVideo: videos[0]?.video_files[0]?.link,
        });
      }

      setScenes(generatedScenes);
    } catch {
      setError("Gemini video planning failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Reorder Scenes ---------- */
  const moveScene = (index: number, dir: "up" | "down") => {
    setScenes((prev) => {
      const copy = [...prev];
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-white">
      <h1 className="text-3xl font-bold">AI Video Generator</h1>

      {/* Input */}
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
        <label className="text-sm text-gray-400">
          Video Topic or Script (Gemini powered)
        </label>

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full h-36 p-3 bg-black border border-neutral-700 rounded"
          placeholder="Make a video on the universe"
        />

        <button
          onClick={() => setConfirmed(true)}
          disabled={!userInput}
          className="px-6 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Confirm Input
        </button>
      </div>

      {/* Generation */}
      {confirmed && (
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Scenes & Footage</h2>
            <button
              onClick={generateScenes}
              className="px-5 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              {loading ? "Planning…" : "Generate Scenes"}
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {script && (
            <div className="bg-black border border-neutral-700 p-4 rounded text-sm">
              <b>Final Script (Gemini)</b>
              <p className="mt-2 text-gray-300">{script}</p>
            </div>
          )}

          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              className="border border-neutral-700 rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    Scene {i + 1}: {scene.text}
                  </p>
                  <p className="text-xs text-gray-400">
                    AI Footage Type: {scene.footageType}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => moveScene(i, "up")}>↑</button>
                  <button onClick={() => moveScene(i, "down")}>↓</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {scene.videos.map((v) => {
                  const link = v.video_files[0]?.link;
                  return (
                    <video
                      key={v.id}
                      src={link}
                      controls
                      onClick={() =>
                        setScenes((prev) =>
                          prev.map((s) =>
                            s.id === scene.id
                              ? { ...s, selectedVideo: link }
                              : s
                          )
                        )
                      }
                      className={`cursor-pointer rounded border ${
                        scene.selectedVideo === link
                          ? "border-red-600"
                          : "border-neutral-700"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
