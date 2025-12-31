"use client";

import { useState } from "react";

export default function ThumbnailPage() {
  const [prompt, setPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  /* ---------------- ENHANCE PROMPT ---------------- */
  const enhancePrompt = async () => {
    if (!prompt) return;

    setEnhancing(true);
    setError("");

    try {
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: "thumbnail",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.enhancedPrompt) {
        throw new Error(data.error || "Prompt enhancement failed");
      }

      setPrompt(data.enhancedPrompt);
    } catch (err: any) {
      setError(err.message || "Prompt enhancement failed");
    } finally {
      setEnhancing(false);
    }
  };

  /* ---------------- GENERATE THUMBNAIL ---------------- */
  const generateThumbnail = async () => {
    if (!prompt) return;

    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: "16:9",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.imageBase64) {
        throw new Error(data.error || "Thumbnail generation failed");
      }

      setImageUrl(`data:${data.mimeType};base64,${data.imageBase64}`);
    } catch (err: any) {
      setError(err.message || "Thumbnail generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            Thumbnail Generator
          </h1>
          <p className="text-gray-400">
            Generate high-CTR YouTube thumbnails using AI
          </p>
        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="YouTube thumbnail for AWS tutorial"
            className="w-full min-h-[140px] bg-black text-white border border-neutral-700 rounded p-4 resize-none"
          />

          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="px-4 py-2 border border-neutral-600 bg-gray-800 hover:bg-gray-700 rounded font-semibold disabled:opacity-60"
            >
              {enhancing ? "Enhancing..." : "Enhance Prompt ✨"}
            </button>

            <button
              onClick={generateThumbnail}
              disabled={loading}
              className="ml-auto px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Thumbnail"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {imageUrl && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 flex justify-center">
            <img
              src={imageUrl}
              alt="Generated Thumbnail"
              className="w-full max-w-[720px] aspect-video object-cover rounded-xl border border-neutral-800 bg-black"
            />
          </div>
        )}
      </div>
    </main>
  );
}


import { useState } from "react";

export default function ThumbnailPage() {
  const [prompt, setPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  /* ---------------- ENHANCE PROMPT ---------------- */
  const enhancePrompt = async () => {
    if (!prompt) return;

    setEnhancing(true);
    setError("");

    try {
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: "thumbnail", // 👈 tells backend how to enhance
        }),
      });

      const text = await res.text();
      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid enhance response");
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      if (!data.enhancedPrompt) {
        throw new Error("No enhanced prompt returned");
      }

      setPrompt(data.enhancedPrompt);
    } catch (err: any) {
      setError(err.message || "Prompt enhancement failed");
    } finally {
      setEnhancing(false);
    }
  };

  /* ---------------- GENERATE THUMBNAIL ---------------- */
  const generateThumbnail = async () => {
    if (!prompt) return;

    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: "16:9", // 🔥 THUMBNAIL FORMAT
        }),
      });

      const text = await res.text();
      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid image response");
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate thumbnail");
      }

      if (!data.imageBase64) {
        throw new Error("No image returned");
      }

      setImageUrl(
        `data:${data.mimeType};base64,${data.imageBase64}`
      );
    } catch (err: any) {
      setError(err.message || "Thumbnail generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            Thumbnail Generator
          </h1>
          <p className="text-gray-400">
            Generate high-CTR YouTube thumbnails using AI
          </p>
        </div>

<<<<<<< HEAD
        {/* Prompt Box */}
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="YouTube thumbnail for AWS tutorial"
            className="
              w-full min-h-[140px]
              bg-black text-white
              border border-neutral-700
              rounded p-4 resize-none
            "
          />
=======
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
          {loading ? "Generating..." : "Generate Thumbnails"}
        </button>
      </div>

      {/* Variations */}
      {images.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <ThumbnailVariations
  images={images}
  selectedImage={selectedImage}
  onSelect={setSelectedImage}
/>


        </div>
      )}
>>>>>>> 92712c8 (Resolve merge conflict in ThumbnailVariations)

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="
                px-4 py-2
                border border-neutral-600
                bg-gray-800 hover:bg-gray-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {enhancing
                ? "Enhancing..."
                : "Enhance / Re-enhance Prompt ✨"}
            </button>

            <button
              onClick={generateThumbnail}
              disabled={loading}
              className="
                ml-auto px-6 py-2
                bg-red-600 hover:bg-red-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {loading ? "Generating..." : "Generate Thumbnail"}
            </button>
          </div>


        </div>
      )}
>>>>>>> 92712c8 (Resolve merge conflict in ThumbnailVariations)

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="
                px-4 py-2
                border border-neutral-600
                bg-gray-800 hover:bg-gray-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {enhancing
                ? "Enhancing..."
                : "Enhance / Re-enhance Prompt ✨"}
            </button>

            <button
              onClick={generateThumbnail}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
<<<<<<< HEAD

        {/* Thumbnail Result */}
        {imageUrl && (
          <div className="bg-[#121212] border border-gray-800
