"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function PromptBox() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const imageRef = useRef<HTMLDivElement>(null);

  async function generateImage() {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setImage(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      if (!data.imageBase64 || !data.mimeType) {
        throw new Error("Invalid image response");
      }

      // ✅ Base64 → browser image
      const imageUrl = `data:${data.mimeType};base64,${data.imageBase64}`;
      setImage(imageUrl);

      setTimeout(() => {
        imageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* PROMPT BOX */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create…"
          className="
            w-full h-36 resize-none bg-transparent
            text-lg text-white placeholder:text-gray-400
            outline-none
          "
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={generateImage}
            disabled={loading}
            className="
              px-8 py-3 rounded-2xl
              font-medium text-black
              bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400
              disabled:opacity-50
              flex items-center gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>

        {error && <p className="mt-3 text-red-400">{error}</p>}
      </div>

      {/* GENERATED IMAGE */}
      {image && (
        <div
          ref={imageRef}
          className="rounded-2xl overflow-hidden border border-white/10 shadow-lg"
        >
          <img
            src={image}
            alt="Generated image"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
