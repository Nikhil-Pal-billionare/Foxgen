import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { applyDiscount } from "@/lib/pricing";

export async function POST(req: Request) {
  const { code, amount } = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (!data || error) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const finalAmount = applyDiscount(
    amount,
    data.discount_type,
    data.discount_value
  );

  return NextResponse.json({
    discount: amount - finalAmount,
    finalAmount,
    codeId: data.id,
  });
}
