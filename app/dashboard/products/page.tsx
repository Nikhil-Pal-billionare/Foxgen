"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Sparkles, 
  Mic, 
  Image as ImageIcon, 
  Scissors, 
  Film, 
  ImagePlus, 
  Video, 
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const router = useRouter();

  const [videoRes, setVideoRes] = useState<"480p" | "720p">("480p");
  const [adsRes, setAdsRes] = useState<"480p" | "720p">("480p");

  const videoCost = videoRes === "480p" ? 52 : 115;
  const adsCost = adsRes === "480p" ? 52 : 115;

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">Our Creative Suite</h1>
        <p className="text-gray-400">Powerful AI tools to supercharge your content creation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Script Generator */}
        <ProductCard
          title="Script Generator"
          desc="Generate creative AI scripts for your videos, ads, and more."
          cost="10 credits"
          icon={Sparkles}
          color="text-yellow-400"
          bg="bg-yellow-400/10"
          onGenerate={() => router.push("/dashboard/script-generator")}
        />

        {/* Voiceover */}
        <ProductCard
          title="Voiceover Generator"
          desc="Convert text into realistic, human-like voiceovers in seconds."
          cost="16 credits / minute"
          icon={Mic}
          color="text-blue-400"
          bg="bg-blue-400/10"
          onGenerate={() => router.push("/dashboard/voiceover-generator")}
        />

        {/* Image Generator */}
        <ProductCard
          title="Image Generator"
          desc="Create stunning high-quality AI images from simple text prompts."
          cost="20 credits"
          icon={ImageIcon}
          color="text-purple-400"
          bg="bg-purple-400/10"
          onGenerate={() => router.push("/dashboard/image-generator")}
        />

        {/* AI Cut Editor */}
        <ProductCard
          title="AI Cut Editor"
          desc="Smartly detect silences and cuts in your video/audio to speed up editing."
          cost="3 credits / minute"
          icon={Scissors}
          color="text-pink-400"
          bg="bg-pink-400/10"
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
          desc="Turn static images into engaging AI-generated video clips."
          cost={`${videoCost} credits`}
          icon={Film}
          color="text-green-400"
          bg="bg-green-400/10"
        >
          <div className="flex items-center gap-3 w-full">
            <ResolutionSelect value={videoRes} onChange={setVideoRes} />
            <GenerateButton
              onClick={() =>
                router.push(`/dashboard/video-generator?res=${videoRes}`)
              }
            />
          </div>
        </ProductCard>

        {/* Thumbnail */}
        <ProductCard
          title="Thumbnail Generator"
          desc="Generate click-worthy YouTube thumbnails automatically."
          cost="40 credits"
          icon={ImagePlus}
          color="text-red-400"
          bg="bg-red-400/10"
          onGenerate={() => router.push("/dashboard/thumbnail")}
        />

        {/* AI Ads */}
        <ProductCard
          title="AI Ads Generator"
          desc="Generate high-converting AI-powered video ads for social media."
          cost={`${adsCost} credits`}
          icon={Video}
          color="text-orange-400"
          bg="bg-orange-400/10"
        >
             <div className="flex items-center gap-3 w-full">
            <ResolutionSelect value={adsRes} onChange={setAdsRes} />
            <GenerateButton
              onClick={() =>
                router.push(`/dashboard/ads-generator?res=${adsRes}`)
              }
            />
          </div>
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
  icon: Icon,
  color,
  bg,
  onGenerate,
  children,
}: {
  title: string;
  desc: string;
  cost: string;
  icon?: any;
  color?: string;
  bg?: string;
  onGenerate?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl bg-[#111] border border-white/5 p-6 space-y-5 hover:border-white/20 hover:bg-[#161616] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl shadow-black/50">
      
      {/* Icon & Title */}
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", bg)}>
          {Icon ? <Icon className={cn("w-6 h-6", color)} /> : <Zap className="w-6 h-6 text-white" />}
        </div>
        <div className="bg-white/5 px-2.5 py-1 rounded-full text-xs font-medium text-gray-400 border border-white/5">
          {cost}
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
      </div>

      <div className="pt-2 mt-auto">
        {children ?? <GenerateButton onClick={onGenerate!} fullWidth />}
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

function GenerateButton({ onClick, fullWidth }: { onClick: () => void; fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all rounded-lg text-sm font-semibold",
        fullWidth ? "w-full" : ""
      )}
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
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
