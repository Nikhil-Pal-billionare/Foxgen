"use client";

import { useState, useEffect } from "react";

export default function MotionVideoPage() {
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(""); // "processing", "success", "failed"
  const [videoResult, setVideoResult] = useState<string | null>(null);

  // Default values for quicker testing
  const [prompt, setPrompt] = useState("Waves crashing on a beach, cinematic style");
  const [imageUrl, setImageUrl] = useState("https://cdn.pixabay.com/photo/2026/02/13/15/27/15-27-30-567_1280.jpg");
  const [videoUrl, setVideoUrl] = useState("https://cdn.pixabay.com/video/2020/03/24/33471-394432298_tiny.mp4");

  // Polling Effect: Checks status every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (taskId && status !== "success" && status !== "failed") {
      setStatus("processing");
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/video/status?taskId=${taskId}`);
          const data = await res.json();
          console.log("Poll Status:", data);

          const taskStatus = data.data?.status;

          // Check success conditions
          if (data.data?.results?.video_url) {
            setVideoResult(data.data.results.video_url);
            setStatus("success");
          } else if (taskStatus === "SUCCESS" || taskStatus === 1) {
             if (data.data?.results?.video_url) {
                 setVideoResult(data.data.results.video_url);
                 setStatus("success");
             }
          } else if (taskStatus === "FAILED" || taskStatus === 2) {
             setStatus("failed");
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 5000); 
    }

    return () => clearInterval(interval);
  }, [taskId, status]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTaskId(null);
    setStatus("");
    setVideoResult(null);

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl, videoUrl }),
      });

      const data = await res.json();

      if (!res.ok || (data.code && data.code !== 200)) {
        alert(`Error: ${data.error || data.msg || "Unknown error"}`);
        setLoading(false);
        return;
      }
      
      const newTaskId = data.data?.id || data.data?.taskId || data.data?.recordId;

      if (newTaskId) {
        setTaskId(newTaskId);
        setStatus("processing");
      } else {
        alert("Video started but no Task ID returned.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Kling 2.6 Motion Control</h1>
      
      <form onSubmit={handleGenerate} className="space-y-4 text-black">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Prompt</label>
          <textarea required className="w-full p-2 border rounded" rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-200 mb-1">Source Image URL</label>
           <input required type="url" className="w-full p-2 border rounded" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-200 mb-1">Motion Video URL</label>
           <input required type="url" className="w-full p-2 border rounded" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        </div>

        <button
          type="submit"
          disabled={loading || status === "processing"}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
        >
          {loading ? "Initializing..." : status === "processing" ? "Generating..." : "Generate Video (1080p)"}
        </button>
      </form>

      {/* Status & Video Display */}
      {taskId && (
        <div className="mt-8 p-6 bg-gray-800 rounded border border-gray-700">
          <h3 className="text-xl font-bold mb-2">
            Status: <span className={status === "success" ? "text-green-400" : status === "failed" ? "text-red-500" : "text-yellow-400"}>
              {status === "processing" ? "Processing" : status}
            </span>
          </h3>
          <p className="text-xs text-gray-400 mb-4 break-all">Task ID: {taskId}</p>
          
          {status === "processing" && (
            <div className="w-full">
               <div className="w-full bg-gray-700 rounded-full h-2.5 animate-pulse mb-2">
                 <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "60%" }}></div>
               </div>
               <p className="text-sm text-center text-yellow-200">
                 Please wait 3-6 minutes. Do not close this tab.
               </p>
            </div>
          )}

          {status === "failed" && <p className="text-red-500 font-bold">Video generation failed.</p>}

          {videoResult && (
            <div className="mt-4 animate-in fade-in duration-500">
              <h4 className="text-lg font-semibold mb-2">Your Video:</h4>
              <div className="relative pt-[56.25%] bg-black rounded overflow-hidden shadow-2xl">
                <video controls src={videoResult} className="absolute top-0 left-0 w-full h-full" autoPlay loop playsInline />
              </div>
              <a href={videoResult} target="_blank" rel="noopener noreferrer" className="block mt-4 text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold">
                Download Video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
