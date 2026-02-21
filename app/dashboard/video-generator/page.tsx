"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Film, Loader2, Move } from "lucide-react";

export default function VideoGeneratorPage() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<"script" | "motion">("script");
  
  // Script States
  const [script, setScript] = useState("");
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);

  // Kling Motion States
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [klingResult, setKlingResult] = useState<any>(null);

  // Kling Generation Logic
  const handleKlingGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl, videoUrl }),
      });
      const data = await res.json();
      if (res.ok) setKlingResult(data);
      else alert(data.error || "Generation failed");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ... (Aapka purana generatePlan aur generateVideo functions yahan rahega)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Film className="text-blue-600" />
          <h1 className="text-4xl font-black">Foxgen AI Video</h1>
        </div>
        
        {/* TABS */}
        <div className="flex bg-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("script")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "script" ? "bg-blue-600" : ""}`}
          >
            Script to Video
          </button>
          <button 
            onClick={() => setActiveTab("motion")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "motion" ? "bg-blue-600" : ""}`}
          >
            Motion Control
          </button>
        </div>
      </div>

      {activeTab === "script" ? (
        <section>
          {/* Aapka Purana Script Input aur UI Yahan Aayega */}
          {/* ... (step check logic) */}
        </section>
      ) : (
        <section className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <Move size={20} />
            <h2 className="text-xl font-bold">Kling 2.6 Motion Control</h2>
          </div>
          
          <form onSubmit={handleKlingGenerate} className="space-y-4">
            <textarea
              required
              placeholder="Describe the motion..."
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              required
              type="url"
              placeholder="Source Image URL (.jpg)"
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <input
              required
              type="url"
              placeholder="Motion Reference Video URL (.mp4)"
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Generate Motion Video</>}
            </button>
          </form>

          {klingResult && (
            <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded-xl">
              <p className="text-sm font-bold">Task ID: <span className="font-mono">{klingResult.id || klingResult.data?.id}</span></p>
              <p className="text-xs text-gray-400 mt-1">Generation started! Check back in 2-5 minutes.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}