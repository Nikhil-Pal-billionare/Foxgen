import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomUUID } from "crypto";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
import { deductCreditsServer } from "@/utils/deductCreditsServer";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export async function POST(req: Request) {
  const supabase = createClient();
  let userId: string | null = null;

  const currentCost = CREDIT_COSTS.IMAGE_TO_VIDEO_720P;

  try {
    console.log("========= MOTION GENERATE START =========");

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Auth user:", user);
    console.log("Auth error:", authError);

    if (!user || authError) {
      console.log("❌ Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;
    console.log("User ID from auth:", userId);

    /* ================= CREDIT CHECK DEBUG ================= */
    const { data: creditRow, error: creditError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    console.log("Credit row fetched:", creditRow);
    console.log("Credit fetch error:", creditError);
    console.log("Cost to deduct:", currentCost);

    /* ================= ENSURE DAILY ================= */
    await ensureDailyFreeCredits(userId);

    /* ================= FORM DATA ================= */
    const formData = await req.formData();

    const prompt = String(formData.get("prompt") || "").trim();
    const imageFile = formData.get("imageFile") as File | null;
    const videoFile = formData.get("videoFile") as File | null;

    console.log("Prompt:", prompt);
    console.log("Image file exists:", !!imageFile);
    console.log("Video file exists:", !!videoFile);

    if (!prompt || !imageFile || !videoFile) {
      console.log("❌ Missing input data");
      return NextResponse.json(
        { error: "Prompt, image and video required" },
        { status: 400 }
      );
    }

    /* ================= DEDUCT CREDITS ================= */
    try {
      console.log("Calling deductCreditsServer...");

      const deductResult = await deductCreditsServer({
        userId,
        amount: currentCost,
        reason: "video_generation_motion",
      });

      console.log("Deduct success:", deductResult);

    } catch (creditErr: any) {
      console.log("❌ DEDUCT ERROR:", creditErr.message);
      return NextResponse.json(
        { error: creditErr.message },
        { status: 402 }
      );
    }

    /* ================= UPLOAD FILES ================= */
    const uploadToStorage = async (file: File) => {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = `motion-inputs/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error } = await supabaseAdmin.storage
        .from("user-submissions")
        .upload(filePath, buffer, {
          contentType: file.type,
        });

      if (error) {
        console.log("❌ Upload error:", error);
        throw error;
      }

      const { data } = supabaseAdmin.storage
        .from("user-submissions")
        .getPublicUrl(filePath);

      console.log("Uploaded file public URL:", data.publicUrl);

      return data.publicUrl;
    };

    const imageUrl = await uploadToStorage(imageFile);
    const referenceVideoUrl = await uploadToStorage(videoFile);

    /* ================= CREATE KIE TASK ================= */
    const payload = {
      model: "kling-2.6/motion-control",
      input: {
        prompt,
        input_urls: [imageUrl],
        video_urls: [referenceVideoUrl],
        character_orientation: "video",
        mode: "1080p",
      },
    };

    console.log("Sending payload to KIE:", payload);

    const response = await fetch(
      "https://api.kie.ai/api/v1/jobs/createTask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.KIE_API_KEY?.trim()}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("KIE response:", data);

    if (!response.ok || data.code !== 200) {
      console.log("❌ KIE task creation failed");
      return NextResponse.json(
        { error: data.msg || "KIE task failed" },
        { status: 400 }
      );
    }

    const taskId =
      typeof data.data === "object"
        ? data.data.taskId
        : data.data;

    console.log("Task ID:", taskId);

    console.log("========= MOTION GENERATE SUCCESS =========");

    return NextResponse.json({
      id: taskId,
      status: "queued",
    });

  } catch (err: any) {
    console.log("❌ FATAL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Motion generation failed" },
      { status: 500 }
    );
  }
}