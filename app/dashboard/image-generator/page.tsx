"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export default function ImageGeneratorPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [showTalentPrompt, setShowTalentPrompt] = useState(false);

  /* =========================
     ENHANCE PROMPT
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
    setShowTalentPrompt(false);

    try {
      await deductCredits({
        amount: CREDIT_COSTS.TEXT_TO_IMAGE,
        reason: "Text to Image generation",
        meta: { prompt },
      });

      const res = await fetch("/api/ai/image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

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
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setShowTalentPrompt(true); // 🔥 show message
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
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

          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              {enhancing ? "Enhancing..." : "Enhance Prompt ✨"}
            </button>

            <button
              onClick={generateImage}
              disabled={loading}
              className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              {loading ? "Generating..." : "Generate Image (20 credits)"}
            </button>
          </div>
        </div>

        {/* Image Result */}
        {imageUrl && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 space-y-4 text-center">
            <img
              src={imageUrl}
              alt="Generated"
              className="max-w-[512px] mx-auto rounded-xl border border-neutral-800"
            />

            {showTalentPrompt && (
              <div className="mt-4 space-y-3">
                <p className="text-yellow-400 font-medium">
                  Wish to upload this image for our Talent Show?
                  <br />
                  Please download it first.
                </p>

                <div className="flex justify-center gap-4">
                  <a
                    href={imageUrl}
                    download="foxgen-image.png"
                    className="px-4 py-2 bg-gray-700 rounded font-semibold"
                  >
                    Download Image
                  </a>

                  <button
                    onClick={() => router.push("/dashboard/show-your-talent")}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded font-semibold"
                  >
                    Yes, take me there →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
