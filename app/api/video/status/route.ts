import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/getTask?id=${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    // If task is successful and KIE returned a video url, attempt to finalize by
    // downloading the video and uploading to our Supabase 'videos' bucket so we
    // can serve a stable public URL to the client. We look for an existing mapping
    // file to know the userId.
    try {
      const taskStatus = data?.data?.status;
      const possibleUrl = data?.data?.results?.video_url || data?.data?.result?.video_url || data?.data?.results?.videos?.[0]?.url || null;
      if ((taskStatus === "SUCCESS" || taskStatus === 1) && possibleUrl) {
        // try to find existing public URL mapping
        const { data: mappingBuf, error: mappingErr } = await (await import("@/lib/supabaseAdmin")).supabaseAdmin.storage
          .from("user-submissions")
          .download(`video-tasks/${taskId}.json`);

        if (mappingBuf) {
          const buf = await mappingBuf.arrayBuffer();
          const meta = JSON.parse(Buffer.from(buf).toString("utf-8"));
          if (meta?.publicUrl) {
            // return KIE response augmented with our stored public URL
            data._publicUrl = meta.publicUrl;
            return NextResponse.json(data);
          }

          // download and upload
          const fetchRes = await fetch(possibleUrl);
          if (fetchRes.ok) {
            const ab = await fetchRes.arrayBuffer();
            const buffer = Buffer.from(ab);
            const userId = meta.userId || "unknown";
            const storagePath = `videos/${userId}/${taskId}.mp4`;
            const { error: uploadError } = await (await import("@/lib/supabaseAdmin")).supabaseAdmin.storage
              .from("videos")
              .upload(storagePath, buffer, { contentType: "video/mp4", upsert: true });

            if (!uploadError) {
              const { data: publicUrl } = await (await import("@/lib/supabaseAdmin")).supabaseAdmin.storage.from("videos").getPublicUrl(storagePath);
              meta.publicUrl = publicUrl.publicUrl;
              try {
                await (await import("@/lib/supabaseAdmin")).supabaseAdmin.storage.from("user-submissions").update(`video-tasks/${taskId}.json`, Buffer.from(JSON.stringify(meta)), { contentType: "application/json" });
              } catch (e) {}
              data._publicUrl = publicUrl.publicUrl;
              return NextResponse.json(data);
            }
          }
        }
      }
    } catch (fatal) {
      console.warn("finalize failed", fatal);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
