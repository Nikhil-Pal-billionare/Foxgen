import { NextResponse } from 'next/server';
import axios from 'axios';

const KIE_API_KEY = process.env.KIE_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, input_url, video_url } = body;

    if (!KIE_API_KEY) {
      return NextResponse.json(
        { error: "Kie API key not configured" },
        { status: 500 }
      );
    }

    if (!prompt || !input_url || !video_url) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, input_url, or video_url" },
        { status: 400 }
      );
    }

    // Kling 2.6 Motion Control payload structure
    // Using "Standard" mode (usually 1080p implies standard or professional mode depending on specific provider mapping, 
    // but based on prompt '1080p' and '10s')
    const payload = {
      model: "kling-2.6/motion-control",
      callBackUrl: `${SITE_URL}/api/webhooks/kie-motion`, // Ensure you have a webhook handler or remove if polling
      input: {
        prompt: prompt,
        input_urls: [input_url], // The image to animate
        video_urls: [video_url], // The reference motion video
        character_orientation: "video",
        mode: "std_10s", // Standard mode, 10 seconds as requested
      }
    };

    console.log("Sending request to Kie.ai:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://api.kie.ai/api/v1/jobs/createTask",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${KIE_API_KEY}`,
        },
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error("Kie AI Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || "Failed to generate video motion task" },
      { status: error.response?.status || 500 }
    );
  }
}
