import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

async function refundCredits(userId: string, amount: number) {
  const supabase = createClient();
  const { data: current } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (current) {
    await supabase
      .from("credits")
      .update({ balance: current.balance + amount })
      .eq("user_id", userId);

    await supabase.from("credit_logs").insert({
      user_id: userId,
      amount,
      reason: "refund_video_gen_text_failed",
    });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  let userId: string | null = null;
  const currentCost = CREDIT_COSTS.IMAGE_TO_VIDEO_720P;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;

    if (!process.env.KIE_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "KIE_API_KEY is missing on server" },
        { status: 500 }
      );
    }

    await ensureDailyFreeCredits(userId);

    const { prompt } = await req.json();
    if (!prompt || !String(prompt).trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    try {
      await deductCreditsServer({
        userId,
        amount: currentCost,
        reason: "video_generation_text",
      });
    } catch (creditErr: any) {
      return NextResponse.json(
        { error: creditErr.message || "Insufficient credits" },
        { status: 402 }
      );
    }

    const input = {
      prompt: String(prompt).trim(),
      character_orientation: "video",
      mode: "1080p",
      duration: "10",
    };

    const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KIE_API_KEY.trim()}`,
      },
      body: JSON.stringify({ model: "kling-2.6/text-to-video", input }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      if (userId) await refundCredits(userId, currentCost);
      return NextResponse.json(
        { error: data.msg || "Kie API failed" },
        { status: 400 }
      );
    }

    const taskId = typeof data.data === "object" ? data.data.taskId : data.data;
    return NextResponse.json({ id: taskId, status: "queued" });
  } catch (err: any) {
    if (userId) await refundCredits(userId, currentCost);
    return NextResponse.json(
      { error: err.message || "Video generation failed" },
      { status: 500 }
    );
  }
}
