"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function PromptBox() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const imagesRef = useRef<HTMLDivElement>(null);

  async function generateImages() {
    if (!prompt.trim()) {
      setError("Please describe what you want to create");
      return;
    }

    setLoading(true);
    setError("");
    setImages([]); // 🚨 clear old images

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

      /**
       * BACKEND RETURNS:
       * {
       *   imageBase64: string,
       *   mimeType: string
       * }
       */

      if (!data.imageBase64 || !data.mimeType) {
        throw new Error("Invalid image response");
      }

      // ✅ Convert Base64 → Browser Image URL
      const imageUrl = `data:${data.mimeType};base64,${data.imageBase64}`;

      setImages([imageUrl]); // 👈 MUST be array

      // 🔽 Auto-scroll to generated image
      setTimeout(() => {
        imagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* =========================
          PROMPT CARD
      ========================= */}
      <div
        className={`
          relative
          transition-all duration-500
          ${images.length ? "-translate-y-2" : ""}
        `}
      >
        <div
          className="
            rounded-3xl
            bg-gradient-to-br from-white/10 to-white/5
            backdrop-blur-xl
            border border-white/15
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            p-6
          "
        >
          {/* Textarea */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create…"
            className="
              w-full
              h-36
              resize-none
              bg-transparent
              text-lg
              text-white
              placeholder:text-gray-400
              outline-none
              leading-relaxed
            "
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-400">
              Be descriptive for better results
            </span>

            <button
              onClick={generateImages}
              disabled={loading}
              className="
                px-8 py-3
                rounded-2xl
                font-medium
                text-black
                bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400
                hover:opacity-90
                transition
                shadow-lg
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

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* =========================
          GENERATED IMAGE
      ========================= */}
      {images.length > 0 && (
        <div
          ref={imagesRef}
          className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6
          "
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="
                rounded-xl
                overflow-hidden
                border border-white/10
                shadow-lg
                hover:scale-[1.03]
                transition
                bg-black/30
              "
            >
              <img
                src={img}
                alt={`Generated image ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
