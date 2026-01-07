"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BrollPage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [generating, setGenerating] = useState(false);

  /* ----------------------------
     SEARCH FROM PEXELS
  ----------------------------- */
  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setVideos([]);

    try {
      const res = await fetch("/api/broll/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------
     GENERATE VIA AI (OPTION A)
  ----------------------------- */
  async function generateAI() {
    if (!query.trim()) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/broll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate footage");
        return;
      }

      // ✅ SHOW GENERATED CLIPS IMMEDIATELY
      setVideos(data.clips || []);
      setSearched(true);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">B-Roll Library</h1>

      {/* 🔍 SEARCH BAR */}
      <div className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. cinematic night city, startup office b-roll"
          className="
            flex-1
            p-3
            bg-black
            border border-white/20
            rounded-lg
            text-white
            focus:outline-none
            focus:ring-2 focus:ring-red-500/40
          "
        />

        {/* 🔴 RED SEARCH BUTTON */}
        <Button
          onClick={search}
          disabled={loading}
          className="
            bg-red-600
            text-white
            hover:bg-red-500
            active:bg-red-700
            disabled:opacity-60
          "
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* ⏳ SEARCH LOADING */}
      {loading && (
        <p className="text-sm text-gray-400">
          Searching stock footage...
        </p>
      )}

      {/* 🎥 VIDEO RESULTS (SEARCH OR GENERATE) */}
      {videos.length > 0 && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {videos.map((v, i) => (
              <video
                key={i}
                src={v.video_files?.[0]?.link}
                controls
                className="rounded-lg border border-white/10"
              />
            ))}
          </div>

          {/* 👉 NOT SATISFIED CTA */}
          <div
            className="
              mt-8
              border border-white/10
              rounded-xl
              p-6
              text-center
              space-y-3
              bg-white/5
            "
          >
            <p className="text-sm text-gray-300">
              Not satisfied with the results?
            </p>

            <Button
              onClick={generateAI}
              disabled={generating}
              className="
                bg-red-600
                text-white
                hover:bg-red-500
                active:bg-red-700
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {generating
                ? "Generating..."
                : "Generate New Footage (10 credits)"}
            </Button>
          </div>
        </>
      )}

      {/* ❌ NO RESULTS FOUND */}
      {searched && !loading && videos.length === 0 && (
        <div
          className="
            mt-10
            border border-white/10
            rounded-xl
            p-8
            text-center
            space-y-4
            bg-white/5
          "
        >
          <h3 className="text-lg font-semibold">
            No stock footage found
          </h3>

          <p className="text-sm text-gray-400">
            Would you like to generate custom B-Roll using AI?
          </p>

          <Button
            onClick={generateAI}
            disabled={generating}
            className="
              bg-red-600
              text-white
              hover:bg-red-500
              active:bg-red-700
              disabled:opacity-60
            "
          >
            {generating
              ? "Generating..."
              : "Generate New Footage (10 credits)"}
          </Button>
        </div>
      )}
    </div>
  );
}
