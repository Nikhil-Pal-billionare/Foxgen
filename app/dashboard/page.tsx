"use client";

import { useState } from "react";
import GeneratorCard from "./components/GeneratorCard";
import QualitySelector from "./components/QualitySelector";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export default function DashboardPage() {
  const [videoQuality, setVideoQuality] = useState<"480p" | "720p">("480p");
  const [adsQuality, setAdsQuality] = useState<"480p" | "720p">("480p");


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Script Generator */}
      <GeneratorCard
        title="Script Generator"
        description="Generate creative AI scripts"
        credits={`${CREDIT_COSTS.SCRIPT_GENERATION}`}
        onGenerateAction={() => alert("Go to script generator")}
      />

      {/* Voiceover */}
      <GeneratorCard
        title="Voiceover Generator"
        description="Convert text into realistic voice"
        credits={`16 / minute`}
        onGenerateAction={() => alert("Go to voiceover")}
      />

      {/* Image Generator */}
      <GeneratorCard
        title="Image Generator"
        description="Create high-quality AI images"
        credits={`${CREDIT_COSTS.TEXT_TO_IMAGE}`}
        onGenerateAction={() => alert("Go to image generator")}
      />

      {/* Image → Video */}
      <GeneratorCard
        title="Image to Video"
        description="Turn images into AI videos"
        credits={
          videoQuality === "480p"
            ? `${CREDIT_COSTS.IMAGE_TO_VIDEO_480P}`
            : `${CREDIT_COSTS.IMAGE_TO_VIDEO_720P}`
        }
        onGenerateAction={() => alert("Go to video generator")}
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
        credits={`${CREDIT_COSTS.THUMBNAIL_GENERATION}`}
        onGenerateAction={() => alert("Go to thumbnail")}
      />

      {/* AI Ads */}
      <GeneratorCard
        title="AI Ads Generator"
        description="Generate AI-powered video ads"
        credits={
          adsQuality === "480p"
            ? `${CREDIT_COSTS.AI_ADS_480P}`
            : `${CREDIT_COSTS.AI_ADS_720P}`
        }
        onGenerateAction={() => {
          // redirect to AI Ads generator page
          window.location.href = "/dashboard/ai-ads";
        }}
      >
        <QualitySelector
          value={adsQuality}
          onChangeAction={setAdsQuality}
        />
      </GeneratorCard>


    </div>
  );
}
