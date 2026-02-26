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
import { spawnSync } from "child_process";

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
  let errorMessage = "Video generation failed";

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: GEMINI_API_KEY is missing" },
        { status: 500 }
      );
    }

    const ffmpegCheck = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    if (ffmpegCheck.status !== 0) {
      return NextResponse.json(
        { error: "Server dependency missing: ffmpeg is not installed" },
        { status: 500 }
      );
    }

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
    const { script, scenes: incomingScenes } = await req.json();
    const scenes: Scene[] = Array.isArray(incomingScenes) && incomingScenes.length > 0
      ? incomingScenes
      : buildScenesFromScript(script);

    if (!script || scenes.length === 0) {
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
        errorMessage = `Veo returned no videos for scene ${i + 1}`;
        throw new Error("Veo returned no videos");
      }

      const videoFile = generatedVideos[0]?.video;
      if (!videoFile) {
        errorMessage = `Veo response missing downloadable file for scene ${i + 1}`;
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

    const ffmpegRun = spawnSync(
      "ffmpeg",
      ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", finalVideoPath],
      { cwd: clipsDir, stdio: "pipe" }
    );

    if (ffmpegRun.status !== 0) {
      errorMessage = "Failed to stitch clips with ffmpeg";
      throw new Error(ffmpegRun.stderr.toString() || "ffmpeg failed");
    }

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
      errorMessage = uploadError.message || "Supabase upload failed";
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

  } catch (err: any) {
    if (err?.message) {
      errorMessage = err.message;
    }
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
      { error: errorMessage },
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

function buildScenesFromScript(script: string): Scene[] {
  if (!script?.trim()) return [];

  const chunks = script
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
    );

  if (chunks.length === 0) return [];

  return chunks.slice(0, 5).map((sceneText) => ({
    sceneText,
    footageQuery: sceneText,
  }));
}
