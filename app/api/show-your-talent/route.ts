import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!image) {
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    const ext = image.name.split(".").pop() ?? "png";
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = `show-your-talent/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("user-submissions")
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from("talent_submissions")
      .insert({
        user_id: user.id,
        image_path: filePath,
        caption,
      });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SHOW YOUR TALENT ERROR:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
