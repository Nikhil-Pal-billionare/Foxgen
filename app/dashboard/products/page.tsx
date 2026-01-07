"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductsPage() {
  const router = useRouter();

  const [videoRes, setVideoRes] = useState<"480p" | "720p">("480p");
  const [adsRes, setAdsRes] = useState<"480p" | "720p">("480p");

  const videoCost = videoRes === "480p" ? 52 : 115;
  const adsCost = adsRes === "480p" ? 52 : 115;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Our Products</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Script Generator */}
        <ProductCard
          title="Script Generator"
          desc="Generate creative AI scripts"
          cost="10 credits"
          onGenerate={() => router.push("/dashboard/script-generator")}
        />

        {/* Voiceover */}
        <ProductCard
          title="Voiceover Generator"
          desc="Convert text into realistic voice"
          cost="16 credits / minute"
          onGenerate={() => router.push("/dashboard/voiceover-generator")}
        />

        {/* Image Generator */}
        <ProductCard
          title="Image Generator"
          desc="Create high-quality AI images"
          cost="20 credits"
          onGenerate={() => router.push("/dashboard/image-generator")}
        />

        {/* AI Cut Editor */}
        <ProductCard
          title="AI Cut Editor"
          desc="Convert video/audio to text and detect cuts automatically"
          cost="3 credits / minute"
          onGenerate={() => router.push("/dashboard/cut-editor")}
        />

        {/* 🎬 B-Roll Library */}
        <ProductCard
          title="B-Roll Library"
          desc="Search stock footage or generate AI-assisted b-roll using Pexels"
          cost="10 credits"
          onGenerate={() => router.push("/dashboard/broll")}
        />

        {/* Image to Video */}
        <ProductCard
          title="Image to Video"
          desc="Turn images into AI videos"
          cost={`${videoCost} credits`}
        >
          <ResolutionSelect value={videoRes} onChange={setVideoRes} />
          <GenerateButton
            onClick={() =>
              router.push(`/dashboard/video-generator?res=${videoRes}`)
            }
          />
        </ProductCard>

        {/* Thumbnail */}
        <ProductCard
          title="Thumbnail Generator"
          desc="Generate YouTube thumbnails"
          cost="40 credits"
          onGenerate={() => router.push("/dashboard/thumbnail")}
        />

        {/* AI Ads */}
        <ProductCard
          title="AI Ads Generator"
          desc="Generate AI-powered video ads"
          cost={`${adsCost} credits`}
        >
          <ResolutionSelect value={adsRes} onChange={setAdsRes} />
          <GenerateButton
            onClick={() =>
              router.push(`/dashboard/ads-generator?res=${adsRes}`)
            }
          />
        </ProductCard>
      </div>
    </div>
  );
}

/* -------------------- Components -------------------- */

function ProductCard({
  title,
  desc,
  cost,
  onGenerate,
  children,
}: {
  title: string;
  desc: string;
  cost: string;
  onGenerate?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="
        group
        rounded-3xl
        bg-white/5
        border border-white/10
        p-6
        space-y-4

        transition-all duration-300 ease-out
        hover:scale-[1.04]
        hover:-translate-y-1
        hover:border-red-500/40
        hover:shadow-[0_0_30px_rgba(193,39,45,0.25)]
      "
    >
      <div>
        <h3 className="text-lg font-semibold group-hover:text-white transition">
          {title}
        </h3>
        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition">
          {desc}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        Cost: <span className="text-white">{cost}</span>
      </p>

      <div className="pt-2">
        {children ?? <GenerateButton onClick={onGenerate!} />}
      </div>
    </div>
  );
}

function ResolutionSelect({
  value,
  onChange,
}: {
  value: "480p" | "720p";
  onChange: (v: "480p" | "720p") => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as "480p" | "720p")}
      className="
        bg-black
        border border-white/20
        rounded-lg
        px-4 py-2
        text-sm
        focus:outline-none
        focus:ring-2 focus:ring-red-500/40
      "
    >
      <option value="480p">480p</option>
      <option value="720p">720p</option>
    </select>
  );
}

function GenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        px-6 py-2
        bg-red-600
        rounded-lg
        text-sm font-medium

        transition-all duration-200
        hover:bg-red-500
        hover:scale-105
        active:scale-95
      "
    >
      Generate
    </button>
  );
}