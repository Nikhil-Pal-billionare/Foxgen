import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

async function refundCredits(userId: string, amount: number) {
  const supabase = createClient();
  const { data: current } = await supabase.from("credits").select("balance").eq("user_id", userId).single();
  if (current) {
    await supabase.from("credits").update({ balance: current.balance + amount }).eq("user_id", userId);
    await supabase.from("credit_logs").insert({
      user_id: userId,
      amount: amount,
      reason: "refund_video_gen_failed"
    });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  let userId: string | null = null;
  const currentCost = CREDIT_COSTS.IMAGE_TO_VIDEO_720P; // Motion control cost

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;

    await ensureDailyFreeCredits(userId);

    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const imageFile = formData.get("imageFile") as File | null;
    const videoFile = formData.get("videoFile") as File | null;

    /* ---------------- 1. DEDUCT CREDITS ---------------- */
    try {
      await deductCreditsServer({
        userId: userId,
        amount: currentCost,
        reason: "video_generation_motion"
      });
    } catch (creditErr: any) {
      return NextResponse.json({ error: creditErr.message || "Insufficient credits" }, { status: 402 });
    }

    /* ---------------- 2. UPLOAD TO STORAGE ---------------- */
    const uploadToStorage = async (file: File) => {
      const ext = file.name.split(".").pop() ?? "png";
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = `video-gen-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-submissions")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("user-submissions")
        .getPublicUrl(filePath);

      return publicUrl;
    };

    let finalImageUrl = imageFile ? await uploadToStorage(imageFile) : "";
    let finalVideoUrl = videoFile ? await uploadToStorage(videoFile) : "";

    /* ---------------- 3. KIE API CALL ---------------- */
    const input: any = {
      prompt: prompt || "AI Video Generation",
      character_orientation: "video",
      mode: "1080p",
      duration: "10",
    };
    if (finalImageUrl) input.input_urls = [finalImageUrl];
    if (finalVideoUrl) input.video_urls = [finalVideoUrl];

    const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.KIE_API_KEY?.trim()}`,
      },
      body: JSON.stringify({ model: "kling-2.6/motion-control", input }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      if (userId) await refundCredits(userId, currentCost);
      return NextResponse.json({ error: data.msg || "Kie API failed" }, { status: 400 });
    }

    // data.data mein taskId hota hai Kie.ai mein
    const taskId = typeof data.data === 'object' ? data.data.taskId : data.data;

    return NextResponse.json({ id: taskId, status: "queued" });

  } catch (err: any) {
    if (userId) await refundCredits(userId, currentCost);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}