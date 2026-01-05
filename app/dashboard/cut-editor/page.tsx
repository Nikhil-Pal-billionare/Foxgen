"use client";

import { useState } from "react";

type Cut = {
  start: number;
  end: number;
  reason: string;
  confidence: number;
};

export default function CutEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [transcriptText, setTranscriptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis() {
    if (!file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    setCuts([]);
    setTranscriptText("");
    setError("");

    try {
      /* 1️⃣ Upload */
      const fd = new FormData();
      fd.append("file", file);

      const upload = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      }).then((r) => r.json());

      /* 2️⃣ Transcribe */
      const transcript = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: upload.signedUrl }),
      }).then((r) => r.json());

      setTranscriptText(transcript.text);

      /* 3️⃣ Analyze */
      const analysis = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: transcript.words,
          durationSeconds: transcript.audio_duration,
        }),
      }).then((r) => r.json());

      setCuts(analysis.cuts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Cut Editor</h1>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="bg-red-600 px-6 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Analyze Media"}
      </button>

      {/* TRANSCRIPT */}
      {transcriptText && (
        <div className="border border-white/10 p-4 rounded">
          <h2 className="font-semibold mb-2">Transcribed Text</h2>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {transcriptText}
          </p>
        </div>
      )}

      {/* CUTS */}
      {cuts.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Suggested Cuts</h2>

          {cuts.map((c, i) => (
            <div
              key={i}
              className="border border-white/10 p-4 rounded hover:bg-white/5"
            >
              <p className="font-medium">
                ⏱ {Math.round(c.start / 1000)}s →{" "}
                {Math.round(c.end / 1000)}s
              </p>
              <p className="text-sm text-gray-400">
                {c.reason} · {Math.round(c.confidence * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}

      {cuts.length === 0 && transcriptText && (
        <p className="text-sm text-gray-400">
          No strong cut points detected (clean speech).
        </p>
      )}
    </div>
  );
}
