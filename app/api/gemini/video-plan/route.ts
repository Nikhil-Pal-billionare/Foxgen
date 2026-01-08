import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { deductCredits } from "@/utils/deductCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";

type Scene = {
  sceneText: string;
  footageQuery: string;
};

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { script, scenes, voiceoverUrl } = await req.json();

    if (!script || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const creditResult = await deductCredits({
      userId: user.id,
      amount: CREDIT_COSTS.video_plan,
      reason: "video_generation",
      meta: { scenes: scenes.length },
    } as any);

    if (!creditResult.success) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    const timeline = [];

    for (const scene of scenes as Scene[]) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/pexels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: scene.footageQuery,
            perPage: 3,
          }),
        }
      );

      const videos = await res.json();
      if (!videos?.length) continue;

      const bestVideo = videos[0];
      const bestFile =
        bestVideo.video_files.find((v: any) => v.quality === "hd") ||
        bestVideo.video_files[0];

      timeline.push({
        type: "video",
        text: scene.sceneText,
        src: bestFile.link,
        duration: Math.min(bestVideo.duration, 6),
        source: "pexels",
      });
    }

    return NextResponse.json({
      script,
      timeline,
      audio: voiceoverUrl
        ? { type: "audio", src: voiceoverUrl }
        : null,
      status: "ready_for_render",
    });
  } catch (err) {
    console.error("VIDEO ERROR:", err);
    return NextResponse.json(
      { error: "Video generation failed" },
      { status: 500 }
    );
  }
}
