import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { generateImage } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 🔥 generateImage RETURNS A STRING
    const imageBase64 = await generateImage(prompt);

    // ✅ NORMALIZED RESPONSE
    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
    });
  } catch (err: any) {
    console.error("IMAGE API ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}