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
      setError("Please upload an audio or video file");
      return;
    }

    setLoading(true);
    setError("");
    setCuts([]);
    setTranscriptText("");

    try {
      /* =========================
         1️⃣ UPLOAD TO SUPABASE
      ========================= */
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });

      const upload = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(upload.error || "Upload failed");
      }

      /* =========================
         2️⃣ TRANSCRIBE (ASSEMBLY AI)
      ========================= */
      const transcriptRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: upload.signedUrl,
        }),
      });

      const transcript = await transcriptRes.json();
      if (!transcriptRes.ok) {
        throw new Error(transcript.error || "Transcription failed");
      }

      /* =========================
         ✅ BUILD TRANSCRIPT TEXT
         (AssemblyAI-safe)
      ========================= */
      if (transcript.text) {
        setTranscriptText(transcript.text);
      } else if (Array.isArray(transcript.words)) {
        const fullText = transcript.words
          .map((w: any) => w.text)
          .join(" ");
        setTranscriptText(fullText);
      }

      /* =========================
         3️⃣ ANALYZE CUTS
      ========================= */
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: transcript.words,
          durationSeconds: transcript.audio_duration,
        }),
      });

      const analysis = await analysisRes.json();
      if (!analysisRes.ok) {
        throw new Error(analysis.error || "Analysis failed");
      }

      setCuts(analysis.cuts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Cut Editor</h1>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="
          px-6 py-2 rounded
          bg-red-600 hover:bg-red-700
          disabled:opacity-50
          transition
        "
      >
        {loading ? "Analyzing..." : "Analyze Media"}
      </button>

      {/* =========================
          TRANSCRIBED TEXT
      ========================= */}
      {transcriptText && (
        <div className="border border-[var(--border)] p-4 rounded space-y-2">
          <h2 className="font-semibold">Transcribed Text</h2>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {transcriptText}
          </p>
        </div>
      )}

      {/* =========================
          CUT SUGGESTIONS
      ========================= */}
      {cuts.length > 0 && (
        <div className="space-y-2 mt-6">
          <h2 className="font-semibold">Suggested Cuts</h2>

          {cuts.map((c, i) => (
            <div
              key={i}
              className="
                hover-lift
                border border-[var(--border)]
                p-4 rounded
                transition
              "
            >
              <p>
                ⏱ {Math.round(c.start / 1000)}s →{" "}
                {Math.round(c.end / 1000)}s
              </p>
              <p className="text-sm text-gray-400">
                Reason: {c.reason} ({Math.round(c.confidence * 100)}%)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
