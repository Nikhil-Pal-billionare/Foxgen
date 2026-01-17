import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
import { CREDIT_COSTS } from "@/lib/creditCosts";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

/* ---------------- INIT AI ---------------- */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* ---------------- TYPES ---------------- */
type Scene = {
  sceneText: string;
  footageQuery: string;
};

const CLIP_DURATION = 8;

/* ===============================
   POST /api/gemini/video-plan
================================ */
export async function POST(req: Request) {
  const supabase = createClient();        // user/session client
  let userId: string | null = null;
  let creditsDeducted = false;
  let jobId: string | null = null;

  try {
    /* ---------------- AUTH ---------------- */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;

    /* ---------------- ENSURE FREE CREDITS ---------------- */
    await ensureDailyFreeCredits(userId);

    /* ---------------- INPUT ---------------- */
    const { script, scenes } = await req.json();

    if (!script || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    /* ---------------- DEDUCT CREDITS ---------------- */
    await deductCreditsServer({
      userId,
      amount: CREDIT_COSTS.video_plan, // positive
      reason: "video_generation",
      meta: { sceneCount: scenes.length },
    });

    creditsDeducted = true;

    /* ---------------- JOB DIR ---------------- */
    jobId = crypto.randomUUID();
    const clipsDir = path.join("/tmp", jobId);
    fs.mkdirSync(clipsDir, { recursive: true });

    /* ---------------- BASE PROMPT ---------------- */
    const basePrompt = `
Cinematic ultra-realistic video.
Style: Film-grade, smooth motion
Lighting: Natural, consistent
Camera: Stable cinematic camera
Continuity rules:
- Same environment
- Same lighting
- Same camera style
- No sudden changes
`;

    const timeline: string[] = [];

    /* ---------------- GENERATE VEO CLIPS ---------------- */
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i] as Scene;

      const prompt = `
${basePrompt}

Scene context:
${scene.footageQuery}

Narration context:
${scene.sceneText}

Motion:
${getMotion(i)}

Duration: ${CLIP_DURATION} seconds.
Maintain continuity with previous scene.
`;

      console.log(`🎬 Generating clip ${i + 1}`);

      let operation = await ai.models.generateVideos({
        model: "veo-3.1-generate-preview",
        prompt,
        config: { resolution: "1080p" },
      });

      while (!operation.done) {
        await new Promise((r) => setTimeout(r, 8000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos?.length) {
        throw new Error("Veo returned no videos");
      }

      const videoFile = generatedVideos[0]?.video;
      if (!videoFile) {
        throw new Error("Missing video file");
      }

      const clipPath = path.join(clipsDir, `clip_${i + 1}.mp4`);

      await ai.files.download({
        file: videoFile,
        downloadPath: clipPath,
      });

      timeline.push(`file 'clip_${i + 1}.mp4'`);
    }

    /* ---------------- STITCH FINAL VIDEO ---------------- */
    const listFile = path.join(clipsDir, "list.txt");
    const finalVideoPath = path.join(clipsDir, "final.mp4");

    fs.writeFileSync(listFile, timeline.join("\n"));

    execSync(
      `ffmpeg -y -f concat -safe 0 -i ${listFile} -c copy ${finalVideoPath}`,
      { cwd: clipsDir }
    );

    /* ---------------- UPLOAD (SERVICE ROLE) ---------------- */
    const videoBuffer = fs.readFileSync(finalVideoPath);
    const storagePath = `videos/${userId}/${jobId}.mp4`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videos")
      .upload(storagePath, videoBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("videos")
      .getPublicUrl(storagePath);

    /* ---------------- SUCCESS ---------------- */
    return NextResponse.json({
      status: "render_complete",
      videoUrl: publicUrl.publicUrl,
      clipCount: scenes.length,
    });

  } catch (err) {
    console.error("🎬 VIDEO GENERATION ERROR:", err);

    /* ---------------- SAFE REFUND ---------------- */
    if (creditsDeducted && userId) {
      try {
        const { data } = await supabase
          .from("credits")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (data) {
          await supabase.from("credits").update({
            balance: data.balance + CREDIT_COSTS.video_plan,
            updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
        }
      } catch (refundErr) {
        console.error("⚠️ Refund failed:", refundErr);
      }
    }

    return NextResponse.json(
      { error: "Video generation failed" },
      { status: 500 }
    );
  }
}

/* ---------------- CAMERA MOTION ---------------- */
function getMotion(index: number) {
  const motions = [
    "Slow forward camera movement",
    "Gentle downward movement",
    "Smooth left pan revealing depth",
    "Camera moves forward with slight acceleration",
    "Wide cinematic reveal shot",
  ];
  return motions[index % motions.length];
}
