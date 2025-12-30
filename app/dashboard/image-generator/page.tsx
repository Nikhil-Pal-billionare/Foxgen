"use client";

import { useState } from "react";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  /* =========================
     ENHANCE / RE-ENHANCE PROMPT
     (OVERWRITE SAME TEXTAREA)
  ========================= */
  const enhancePrompt = async () => {
    if (!prompt.trim()) return;

    setEnhancing(true);
    try {
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prompt enhancement failed");

      // 🔥 OVERWRITE SAME BOX
      setPrompt(data.enhancedPrompt);
    } catch (err: any) {
      alert(err.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  /* =========================
     GENERATE IMAGE
  ========================= */
  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setImageUrl(null);

    try {
      // 1️⃣ Deduct credits
      await deductCredits({
        amount: CREDIT_COSTS.TEXT_TO_IMAGE,
        reason: "Text to Image generation",
        meta: { prompt },
      });

      // 2️⃣ Call Image API
      const res = await fetch("/api/ai/image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      // ===============================
      // 🔥 Base64 → Image (Gemini-safe)
      // ===============================
      let base64 = data.imageBase64 as string;
      const pad = base64.length % 4;
      if (pad !== 0) base64 += "=".repeat(4 - pad);

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: data.mimeType });
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
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
            AI Image Generator
          </h1>
          <p className="text-gray-400">
            Generate images directly or enhance prompts using Gemini
          </p>
        </div>

        {/* Prompt Box */}
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want..."
            className="
              w-full min-h-[140px]
              bg-black text-white
              border border-neutral-700
              rounded p-4 resize-none
            "
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="
                px-4 py-2
                border border-neutral-600
                bg-red-600 hover:bg-red-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {enhancing ? "Enhancing..." : "Enhance / Re-enhance Prompt ✨"}
            </button>

            <button
              onClick={generateImage}
              disabled={loading}
              className="
                ml-auto px-6 py-2
                bg-red-600 hover:bg-red-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {loading ? "Generating..." : "Generate Image (20 credits)"}
            </button>
          </div>
        </div>

        {/* Image Result */}
        {imageUrl && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 flex justify-center">
            <img
              src={imageUrl}
              alt="Generated"
              className="
                max-w-[512px]
                rounded-xl
                border border-neutral-800
                bg-black
              "
            />
          </div>
        )}
      </div>
    </main>
  );
}
