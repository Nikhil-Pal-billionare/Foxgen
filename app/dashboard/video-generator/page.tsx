"use client";

import { useState, useRef, useEffect } from "react";
import { Film, Loader2, Move, Image as ImageIcon, Upload, X, CheckCircle2, PlayCircle } from "lucide-react";

export default function VideoGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "queued" | "processing" | "completed" | "failed">("idle");
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 🔄 POLLING LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (taskId && (status === "queued" || status === "processing")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/video/status?taskId=${taskId}`);
          const result = await res.json();

          if (result.code === 200) {
            const remoteStatus = result.data.status;
            // Kie status check
            if (remoteStatus === "success") {
              setStatus("completed");
              setFinalVideoUrl(result.data.video_url || result.data.url);
              clearInterval(interval);
            } else if (remoteStatus === "failed") {
              setStatus("failed");
              clearInterval(interval);
            } else {
              setStatus("processing");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 30000); // Check every 30 seconds
    }

    return () => clearInterval(interval);
  }, [taskId, status]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedImage) {
      alert("Please provide a prompt and an image.");
      return;
    }

    setLoading(true);
    setTaskId(null);
    setFinalVideoUrl(null);
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("mode", "motion");
      if (selectedImage) formData.append("imageFile", selectedImage);
      if (selectedVideo) formData.append("videoFile", selectedVideo);

      const res = await fetch("/api/video/generate", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      setTaskId(data.id);
      setStatus("queued");
    } catch (err: any) {
      alert(err.message);
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Film className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">Motion AI</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <section className="bg-[#121212] border border-white/5 p-8 rounded-2xl">
              <form onSubmit={handleGenerate} className="space-y-6">
                <textarea
                  required
                  placeholder="Describe the motion..."
                  className="w-full p-4 bg-black/50 border border-white/10 rounded-xl outline-none focus:border-blue-500 min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => imageInputRef.current?.click()} className="border-2 border-dashed border-white/10 p-8 rounded-xl text-center cursor-pointer">
                    <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
                    {selectedImage ? <span className="text-blue-400 text-xs">{selectedImage.name}</span> : "Add Image"}
                  </div>
                  <div onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-white/10 p-8 rounded-xl text-center cursor-pointer">
                    <input type="file" ref={videoInputRef} hidden accept="video/mp4" onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)} />
                    {selectedVideo ? <span className="text-blue-400 text-xs">{selectedVideo.name}</span> : "Add Video Ref"}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 rounded-xl font-bold">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Generate Video (200 Credits)"}
                </button>
              </form>
            </section>
          </div>

          <div className="sm:col-span-5">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
              {finalVideoUrl ? (
                <video src={finalVideoUrl} controls className="rounded-xl w-full shadow-2xl" />
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-widest">{status}</p>
                  {taskId && <p className="text-[10px] font-mono text-blue-400 mb-4">{taskId}</p>}
                  {loading && <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}