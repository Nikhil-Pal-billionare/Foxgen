"use client";

import { useState } from "react";
import { deductCredits } from "@/utils/deductCredits";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function generateImage() {
    // TEMPORARY — Replace with real API in Module 4
    await deductCredits(2, "AI Image Generation");

    alert("This will generate an AI image in Module 4");

    // Example placeholder
    setImageUrl("/samples/img1.jpg");
  }

  return (
    <div className="max-w-3xl mx-auto py-20 space-y-6">
      <h1 className="text-3xl font-bold">AI Image Generator</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your image..."
        className="w-full p-3 bg-[#111] border border-gray-700 rounded-lg"
      />

      <button
        onClick={generateImage}
        className="px-6 py-3 bg-[#C1272D] rounded-lg hover:bg-[#A02025]"
      >
        Generate
      </button>

      {imageUrl && (
        <img src={imageUrl} className="rounded-lg mt-6" />
      )}
    </div>
  );
}
