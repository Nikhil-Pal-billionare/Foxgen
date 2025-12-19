"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GeneratorCard from "./components/GeneratorCard";
import QualitySelector from "./components/QualitySelector";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export default function DashboardPage() {
  const router = useRouter();

  const [videoQuality, setVideoQuality] = useState<"480p" | "720p">("480p");
  const [adsQuality, setAdsQuality] = useState<"480p" | "720p">("480p");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Script Generator */}
      <GeneratorCard
        title="Script Generator"
        description="Generate creative AI scripts"
        credits={String(CREDIT_COSTS.SCRIPT_GENERATION)}
        onGenerateAction={() => router.push("/dashboard/script-generator")}
      />

      {/* Voiceover */}
      <GeneratorCard
        title="Voiceover Generator"
        description="Convert text into realistic voice"
        credits="16 / minute"
        onGenerateAction={() => router.push("/dashboard/voiceover")}
      />

      {/* Image Generator */}
      <GeneratorCard
        title="Image Generator"
        description="Create high-quality AI images"
        credits={String(CREDIT_COSTS.TEXT_TO_IMAGE)}
        onGenerateAction={() => router.push("/dashboard/image-generator")}
      />

      {/* Image → Video */}
      <GeneratorCard
        title="Video-generator"
        description="Generate videos using scripts and stock footage"
        credits={
          videoQuality === "480p"
            ? String(CREDIT_COSTS.IMAGE_TO_VIDEO_480P)
            : String(CREDIT_COSTS.IMAGE_TO_VIDEO_720P)
        }
        onGenerateAction={() => router.push("/dashboard/video-generator")}
      >
        <QualitySelector
          value={videoQuality}
          onChangeAction={setVideoQuality}
        />
      </GeneratorCard>

      {/* Thumbnail Generator */}
      <GeneratorCard
        title="Thumbnail Generator"
        description="Generate YouTube thumbnails"
        credits={String(CREDIT_COSTS.THUMBNAIL_GENERATION)}
        onGenerateAction={() => router.push("/dashboard/thumbnail")}
      />

      {/* AI Ads Generator */}
      <GeneratorCard
        title="AI Ads Generator"
        description="Generate AI-powered video ads"
        credits={
          adsQuality === "480p"
            ? String(CREDIT_COSTS.AI_ADS_480P)
            : String(CREDIT_COSTS.AI_ADS_720P)
        }
        onGenerateAction={() => router.push("/dashboard/ai-ads")}
      >
        <QualitySelector
          value={adsQuality}
          onChangeAction={setAdsQuality}
        />
      </GeneratorCard>

    </div>
  );
}
