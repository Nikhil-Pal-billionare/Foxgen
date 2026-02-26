import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import fetch from "node-fetch";

async function downloadToBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const taskId = body.taskId || body.id || body.data?.taskId;
    if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

    // Read mapping to find userId
    const mappingKey = `video-tasks/${taskId}.json`;
    const { data: mappingData, error: mappingErr } = await supabaseAdmin.storage
      .from("user-submissions")
      .download(mappingKey);

    let userId: string | null = null;
    if (mappingErr) {
      console.warn("mapping not found for task", taskId);
    } else if (mappingData) {
      const buf = await mappingData.arrayBuffer();
      const json = JSON.parse(Buffer.from(buf).toString("utf-8"));
      userId = json.userId;
    }

    // Try to extract result URL(s) from payload
    const resultUrl = body.data?.results?.video_url || body.data?.result?.video_url || body.data?.results?.videos?.[0]?.url || body.data?.result?.videos?.[0]?.url || body.data?.video_url || body.video_url || null;
    if (!resultUrl) {
      // nothing to do
      return NextResponse.json({ ok: true });
    }

    // Download final video and upload to videos bucket
    const buffer = await downloadToBuffer(resultUrl);
    const storagePath = `videos/${userId || 'unknown'}/${taskId}.mp4`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videos")
      .upload(storagePath, buffer, { contentType: "video/mp4" , upsert: true});

    if (uploadError) {
      console.error("uploadError", uploadError);
      return NextResponse.json({ error: "upload failed" }, { status: 500 });
    }

    const { data: publicUrl } = supabaseAdmin.storage.from("videos").getPublicUrl(storagePath);

    // Save a pointer mapping so status endpoint can return the public url quickly
    try {
      const metaKey = `video-tasks/${taskId}.json`;
      const meta = { taskId, userId, publicUrl: publicUrl.publicUrl };
      await supabaseAdmin.storage.from("user-submissions").update(metaKey, Buffer.from(JSON.stringify(meta)), { contentType: "application/json" });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ ok: true, publicUrl: publicUrl.publicUrl });
  } catch (err: any) {
    console.error("webhook error", err);
    return NextResponse.json({ error: err.message || "webhook error" }, { status: 500 });
  }
}
