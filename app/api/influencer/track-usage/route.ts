import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { codeId, userId, discountAmount } = await req.json();
  const supabase = createClient();

  await supabase.from("code_usages").insert({
    code_id: codeId,
    user_id: userId,
    discount_amount: discountAmount,
  });

  return NextResponse.json({ success: true });
}
