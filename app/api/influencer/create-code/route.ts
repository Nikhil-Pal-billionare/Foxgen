import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createClient();

  const { code, discount_type, discount_value, influencer_id } = body;

  const { error } = await supabase.from("discount_codes").insert({
    code,
    discount_type,
    discount_value,
    influencer_id,
    max_uses: 500,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
