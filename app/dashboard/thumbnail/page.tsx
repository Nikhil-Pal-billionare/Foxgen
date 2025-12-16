"use client";

import { useState } from "react";
import ThumbnailEditor from "./ThumbnailEditor";
import ThumbnailVariations from "./ThumbnailVariations";

import { CREDIT_COSTS } from "@/lib/creditCosts";
import { deductCredits } from "@/utils/deductCredits";

export default function ThumbnailPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt) return;

    setLoading(true);

    try {
      // ✅ Deduct credits BEFORE generation
      await deductCredits({
        amount: CREDIT_COSTS.THUMBNAIL_GENERATION,
        reason: "Thumbnail generation",
        meta: { prompt },
      });

      // 🔴 TEMP: fake AI variations
      setTimeout(() => {
        const generatedImages = [
          "/placeholder-thumbnail.png",
          "/placeholder-thumbnail.png",
          "/placeholder-thumbnail.png",
          "/placeholder-thumbnail.png",
        ];

        setImages(generatedImages);
        setSelectedImage(generatedImages[0]);
        setLoading(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || "Failed to generate thumbnail");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">Thumbnail Generator</h1>
      <p className="text-gray-400 mb-8">
        Generate, edit, and download YouTube thumbnails
      </p>

      {/* Prompt Input */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
        <label className="text-sm text-gray-400">Thumbnail Prompt</label>

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

      {/* Editor */}
      {selectedImage && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Edit & Download
          </h2>

          <ThumbnailEditor imageUrl={selectedImage} />
        </div>
      )}
    </div>
  );
}
