import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import {ensureDailyFreeCredits} from "@/lib/freeCredits";

type Scene = {
  sceneText: string;
  footageQuery: string;
};

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    /* ---------------- AUTH ---------------- */
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 🔥 ENSURE DAILY FREE CREDITS
    await ensureDailyFreeCredits(user.id);

    const userId = user.id;

    /* ---------------- INPUT ---------------- */
    const { script, scenes, voiceoverUrl } = await req.json();

    if (!script || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    /* ---------------- DEDUCT CREDITS ---------------- */
    await deductCreditsServer({
      userId,
      amount: CREDIT_COSTS.video_plan,
      reason: "video_generation",
      meta: { sceneCount: scenes.length },
    });

    /* ---------------- BUILD TIMELINE ---------------- */
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

  } catch (err: any) {
    console.error("🎬 VIDEO GENERATION ERROR:", err);

    /* ---------------- OPTIONAL REFUND ---------------- */
    try {
      const {
        data: { user },
      } = await createClient().auth.getUser();

      if (user) {
        await deductCreditsServer({
          userId: user.id,
          amount: -CREDIT_COSTS.video_plan,
          reason: "refund_video_failed",
        });
      }
    } catch (refundErr) {
      console.error("⚠️ Video refund failed:", refundErr);
    }

    return NextResponse.json(
      { error: "Video generation failed" },
      { status: 500 }
    );
  }
}
