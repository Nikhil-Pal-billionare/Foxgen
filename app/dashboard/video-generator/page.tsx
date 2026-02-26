"use client";

import { useState } from "react";
import { Sparkles, Film, Loader2, Move } from "lucide-react";

export default function VideoGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"script" | "motion">("script");

  /* ===============================
      SCRIPT TO VIDEO STATES
  =============================== */
  const [script, setScript] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);

  /* ===============================
      MOTION CONTROL STATES
  =============================== */
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [motionLoading, setMotionLoading] = useState(false);
  const [motionVideo, setMotionVideo] = useState<string | null>(null);

  /* ===============================
      SCRIPT TO VIDEO
  =============================== */
  const handleScriptGenerate = async () => {
    if (!script.trim()) {
      alert("Please write a Text.");
      return;
    }

    setScriptLoading(true);
    setFinalVideo(null);

    try {
      const res = await fetch("/api/video/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: script }),
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        alert(data.error || "Video generation failed.");
        return;
      }

      await pollVideoStatus(data.id, setFinalVideo);

    } catch {
      alert("Network error occurred.");
    } finally {
      setScriptLoading(false);
    }
  };

  /* ===============================
      MOTION CONTROL
  =============================== */
  const handleKlingGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !videoFile) {
      alert("Please upload both image and reference video.");
      return;
    }

    setMotionLoading(true);
    setMotionVideo(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("imageFile", imageFile);
    formData.append("videoFile", videoFile);

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        alert(data.error || "Generation failed");
        return;
      }

      await pollVideoStatus(data.id, setMotionVideo);

    } catch {
      alert("Network error occurred.");
    } finally {
      setMotionLoading(false);
    }
  };

  /* ===============================
      UNIVERSAL POLLER
  =============================== */
  const pollVideoStatus = async (
    taskId: string,
    setVideo: (url: string) => void
  ) => {
    let tries = 0;
    const maxTries = 72; // 6 minutes

    while (tries < maxTries) {
      await new Promise((r) => setTimeout(r, 5000));
      tries++;

      const res = await fetch(
        `/api/video/status?taskId=${encodeURIComponent(taskId)}`
      );
      const data = await res.json();

      const task = data?.data ?? {};
      const status = task?.status;

      const videoUrl =
        data?._publicUrl ||
        task?.result?.videos?.[0]?.url ||
        task?.results?.videos?.[0]?.url ||
        null;

      if (videoUrl) {
        setVideo(videoUrl);
        return;
      }

      if (status === 2) {
        alert("Video generation failed.");
        return;
      }
    }

    alert("Still processing. Please check again later.");
  };

  /* ===============================
      UI
  =============================== */
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-white">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Film className="text-blue-600" />
          <h1 className="text-4xl font-black">Foxgen AI Video</h1>
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("script")}
            className={`px-4 py-2 rounded-md text-sm font-bold ${
              activeTab === "script" ? "bg-blue-600" : ""
            }`}
          >
            Script to Video
          </button>
          <button
            onClick={() => setActiveTab("motion")}
            className={`px-4 py-2 rounded-md text-sm font-bold ${
              activeTab === "motion" ? "bg-blue-600" : ""
            }`}
          >
            Motion Control
          </button>
        </div>
      </div>

      {/* SCRIPT TAB */}
      {activeTab === "script" ? (
        <section className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6">
          <textarea
            placeholder="Example: A cinematic drone shot..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-xl text-white"
          />

          <button
            onClick={handleScriptGenerate}
            disabled={scriptLoading}
            className="w-full py-4 bg-blue-600 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {scriptLoading ? <Loader2 className="animate-spin" /> : "Generate Script Video"}
          </button>

          {finalVideo && (
            <video src={finalVideo} controls className="w-full rounded" />
          )}
        </section>
      ) : (
        /* MOTION TAB */
        <section className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6">
          <textarea
            required
            placeholder="Describe motion..."
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />

          <input
            type="file"
            accept="video/mp4"
            required
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleKlingGenerate}
            disabled={motionLoading}
            className="w-full py-4 bg-blue-600 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {motionLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles size={18} />
                Generate Motion Video (200 Credits)
              </>
            )}
          </button>

          {motionVideo && (
            <div className="space-y-4">
              <video src={motionVideo} controls className="w-full rounded" />
              <a
                href={motionVideo}
                download
                className="block text-center bg-green-600 py-3 rounded font-bold"
              >
                Download
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  );
}