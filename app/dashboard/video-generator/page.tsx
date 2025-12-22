"use client";

import { useState } from "react";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

import { fetchPexelsVideos, PexelsVideo } from "@/lib/pexels";
import {
  Sparkles,
  Film,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Play,
} from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState("");

  // ✅ STEP 1 — Deduct credits ONCE and generate plan
  const generatePlan = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Deduct credits FIRST
      const creditResult = await deductCredits({ amount: CREDIT_COSTS.video_plan, reason: "video_plan" }); // e.g. 52

      if (!creditResult?.success) {
        setError("Insufficient credits. Please recharge to continue.");
        return;
      }

      // 2️⃣ Call Gemini ONLY after credits are deducted
      const res = await fetch("/api/gemini/video-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });

      if (!res.ok) {
        throw new Error("Gemini API failed");
      }

      const data = await res.json();

      setScript(data.finalScript);
      setScenes(
        data.scenes.map((s: any, i: number) => ({
          ...s,
          id: i,
          videos: [],
        }))
      );
      setStep(2);
    } catch (err) {
  console.error("DEBUG ERROR:", err); // Isse console mein asli error dikhega
  setError(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
}
  };

  const finalizeAndFetch = async () => {
    try {
      setLoading(true);

      const updatedScenes = [...scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        const videos = await fetchPexelsVideos(updatedScenes[i].footageType);
        updatedScenes[i].videos = videos;
        updatedScenes[i].selectedVideo =
          videos[0]?.video_files[0]?.link;
      }

      setScenes(updatedScenes);
      setStep(3);
    } catch {
      setError("Failed to fetch footage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex justify-between mb-12">
        <h1 className="text-4xl font-black text-white flex gap-3">
          <Film className="text-red-600" /> AI Video Studio
        </h1>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-48 p-6 bg-black/50 rounded-2xl"
            placeholder="Describe your video..."
          />
          <button
            onClick={generatePlan}
            disabled={loading || !userInput}
            className="w-full mt-6 py-4 bg-red-600 rounded-xl font-bold"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <>
                <Sparkles size={18} /> Generate Video Plan
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <button
          onClick={finalizeAndFetch}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          Confirm & Fetch Footage
        </button>
      )}

      {/* STEP 3 */}
      {step === 3 &&
        scenes.map((scene, i) => (
          <div key={scene.id} className="mb-12">
            <p className="text-xl italic">"{scene.text}"</p>
          </div>
        ))}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-800 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
