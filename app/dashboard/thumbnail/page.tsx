"use client";

import { useState } from "react";

export default function ThumbnailPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const generate = () => {
    if (!prompt) return;
    setLoading(true);

    setTimeout(() => {
      setImage("/placeholder-thumbnail.png");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Thumbnail Generator
      </h1>
      <p className="text-gray-400 mb-8">
        Create eye-catching thumbnails using AI
      </p>

      {/* Input Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
        <label className="text-sm text-gray-400">
          Thumbnail Prompt
        </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="YouTube thumbnail for AI startup growth"
          className="w-full mt-2 h-28 p-3 bg-black border border-neutral-700 rounded text-white focus:outline-none focus:border-red-600"
        />

        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 px-6 py-2 rounded bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Thumbnail"}
        </button>
      </div>

      {/* Result */}
      {image && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Preview
          </h2>

          <img
            src={image}
            alt="Thumbnail"
            className="rounded border border-neutral-700"
          />

          <a
            href={image}
            download
            className="inline-block mt-4 text-red-500 hover:underline"
          >
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}
