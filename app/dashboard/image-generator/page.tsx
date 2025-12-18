"use client";

import { useState } from "react";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      // ===============================
      // 🔥 THE FIX THAT MAKES IT WORK
      // ===============================

      let base64 = data.imageBase64 as string;

      // 👉 Normalize base64 padding (CRITICAL for Gemini)
      const pad = base64.length % 4;
      if (pad !== 0) {
        base64 += "=".repeat(4 - pad);
      }

      // Decode base64 → bytes
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Create Blob
      const blob = new Blob([bytes], { type: data.mimeType });

      // Convert Blob → Data URL (browser-safe)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">AI Image Generator</h1>
      <p className="text-gray-400 mb-8">
        Generate AI images using Gemini Imagen
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A futuristic AI startup office with neon lighting"
        className="w-full h-32 p-4 bg-black border border-neutral-700 rounded"
      />

      <button
        onClick={generateImage}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Image (20 credits)"}
      </button>

      {imageUrl && (
        <div className="mt-8 flex justify-center">
          <img
            src={imageUrl}
            alt="Generated"
            className="max-w-[512px] rounded-xl border border-neutral-800 bg-white"
          />
        </div>
      )}
    </div>
  );
}
