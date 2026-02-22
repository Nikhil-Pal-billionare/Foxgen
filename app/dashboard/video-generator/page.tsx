"use client";

import { useState } from "react";
import { Sparkles, Film, Loader2, Move, Upload } from "lucide-react";

export default function VideoGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"script" | "motion">("script");

  /* ===============================
      SCRIPT TO VIDEO STATES (UNCHANGED)
  =============================== */
  const [script, setScript] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);

  /* ===============================
      MOTION CONTROL STATES (UPDATED)
  =============================== */
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [motionLoading, setMotionLoading] = useState(false);
  const [klingResult, setKlingResult] = useState<any>(null);

  /* ===============================
      SCRIPT GENERATION LOGIC (UNCHANGED)
  =============================== */
  const handleScriptGenerate = async () => {
    if (!script.trim()) {
      alert("Please write a Text.");
      return;
    }
    setScriptLoading(true);
    setFinalVideo(null);
    try {
      const res = await fetch("/api/script-video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(JSON.stringify(data.error));
        setScriptLoading(false);
        return;
      }
      const taskId = data.taskId;
      const interval = setInterval(async () => {
        const statusRes = await fetch("/api/script-video/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId }),
        });
        const statusData = await statusRes.json();
        if (statusData.videoUrl) {
          setFinalVideo(statusData.videoUrl);
          clearInterval(interval);
          setScriptLoading(false);
        }
        if (statusData.status === "FAILED") {
          alert("Video generation failed.");
          clearInterval(interval);
          setScriptLoading(false);
        }
      }, 5000);
    } catch (err) {
      alert("Network error occurred.");
      setScriptLoading(false);
    }
  };

  /* ===============================
      MOTION CONTROL LOGIC (UPDATED FOR FILES)
  =============================== */
  const handleKlingGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !videoFile) {
        alert("Please upload both an image and a reference video.");
        return;
    }

    setMotionLoading(true);
    setKlingResult(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("imageFile", imageFile);
    formData.append("videoFile", videoFile);

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        // Headers are not needed for FormData, browser sets them automatically
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
          setKlingResult(data);
      } else {
          alert(data.error || "Generation failed");
      }
    } catch {
      alert("Something went wrong with the network.");
    } finally {
      setMotionLoading(false);
    }
  };

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
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "script" ? "bg-blue-600" : ""
            }`}
          >
            Script to Video
          </button>
          <button
            onClick={() => setActiveTab("motion")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "motion" ? "bg-blue-600" : ""
            }`}
          >
            Motion Control
          </button>
        </div>
      </div>

      {/* SCRIPT TO VIDEO TAB (UNCHANGED) */}
      {activeTab === "script" ? (
        <section className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2 text-blue-400">
            <Film size={20} />
            <h2 className="text-xl font-bold">Text to Video</h2>
          </div>
          <textarea
            placeholder="Example: A cinematic drone shot..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleScriptGenerate}
            disabled={scriptLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {scriptLoading ? <Loader2 className="animate-spin" /> : "Generate Script Video"}
          </button>
          {finalVideo && (
            <div className="mt-6 space-y-4">
              <video src={finalVideo} controls className="w-full rounded" />
              <a href={finalVideo} download className="block text-center bg-green-600 py-3 rounded font-bold">Download</a>
            </div>
          )}
        </section>
      ) : (
        /* MOTION CONTROL TAB (UPDATED FOR FILE INPUTS) */
        <section className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <Move size={20} />
            <h2 className="text-xl font-bold">Motion Control</h2>
          </div>

          <form onSubmit={handleKlingGenerate} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Motion Description</label>
                <textarea
                  required
                  placeholder="Describe the movement you want..."
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Source Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Reference Video</label>
                    <input 
                      type="file" 
                      accept="video/mp4"
                      required
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white"
                    />
                </div>
            </div>

            <button
              type="submit"
              disabled={motionLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex justify-center items-center gap-2"
            >
              {motionLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Motion Video (20 Credits)
                </>
              )}
            </button>
          </form>

          {klingResult && (
            <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded-xl">
              <p className="text-sm font-bold">Task ID: <span className="font-mono text-blue-400">{klingResult.id}</span></p>
              <p className="text-xs text-gray-400 mt-1">Started! Video will be ready in 2-5 minutes.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}