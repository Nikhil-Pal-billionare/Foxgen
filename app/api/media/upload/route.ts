import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { ensureDailyFreeCredits } from "@/lib/freeCredits";
export async function POST(req: Request) {
  const supabase = createClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 🔥 ENSURE DAILY FREE CREDITS
  await ensureDailyFreeCredits(user.id);

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("media-uploads")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: signed } = await supabase.storage
    .from("media-uploads")
    .createSignedUrl(filePath, 60 * 60); // 1 hour

  return NextResponse.json({
    filePath,
    signedUrl: signed?.signedUrl,
  });
}
