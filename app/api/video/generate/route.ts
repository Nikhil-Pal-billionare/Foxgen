import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, imageUrl, videoUrl } = body;

    const apiKey = process.env.KIE_API_KEY;
    if (!apiKey) {
      console.error("❌ KIE_API_KEY is missing.");
      return NextResponse.json(
        { error: "Server misconfiguration: API Key missing" },
        { status: 500 }
      );
    }

    // Default payload for Kling 2.6 Motion Control
    const payload = {
      model: "kling-2.6/motion-control",
      // Callbacks are optional but recommended. We use a dummy or real URL.
      callBackUrl: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://foxgen.ai"
      }/api/webhooks/kie`,
      input: {
        prompt: prompt || "A standard video generation",
        input_urls: [imageUrl],
        video_urls: [videoUrl],
        character_orientation: "video",
        mode: "1080p", // Corrected per your testing
        duration: "10", // Corrected per your testing
      },
    };

    console.log("🚀 Sending Payload to Kie:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Log full response for debugging
    console.log("📥 Kie API Response:", data);

    if (!response.ok || (data.code && data.code !== 200)) {
      return NextResponse.json(
        {
          error: data.msg || "Failed to start generation",
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}