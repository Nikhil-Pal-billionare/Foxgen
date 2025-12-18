"use client";

import { useState } from "react";
import { fetchPexelsVideos, PexelsVideo } from "@/lib/pexels";

export default function VideoGeneratorPage() {
  const [script, setScript] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [error, setError] = useState("");

  const generateVideos = async () => {
    try {
      setLoading(true);
      setError("");

      // simple keyword extraction (MVP)
      const keyword = script.split(" ").slice(0, 3).join(" ");

      const results = await fetchPexelsVideos(keyword);
      setVideos(results);
    } catch (err) {
      setError("Could not fetch videos from Pexels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white">
      <h1 className="text-3xl font-bold">AI Video Generator</h1>
      <p className="text-gray-400">
        Generate videos using scripts and stock footage
      </p>

      {/* SCRIPT INPUT */}
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <label className="text-sm text-gray-400">Video Script</label>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full mt-2 h-40 p-3 bg-black border border-neutral-700 rounded text-white"
          placeholder="Write or generate your video script..."
        />

        <button
          onClick={() => setConfirmed(true)}
          disabled={!script}
          className="mt-4 px-6 py-2 bg-red-600 rounded disabled:opacity-50"
        >
          Confirm Script
        </button>
      </div>

      {!confirmed && (
        <p className="text-yellow-500 text-sm">
          ⚠ Please confirm the script to start video generation
        </p>
      )}

      {/* VIDEO GENERATION */}
      {confirmed && (
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Stock Footage (Pexels)
            </h2>

            <button
              onClick={generateVideos}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              {loading ? "Fetching..." : "Generate Videos"}
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {/* VIDEO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <video
                key={video.id}
                src={video.video_files[0]?.link}
                controls
                className="rounded border border-neutral-700"
              />
            ))}
          </div>

          {videos.length === 0 && !loading && (
            <p className="text-gray-400 text-sm">
              No videos yet. Click “Generate Videos”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
