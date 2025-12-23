import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createSupabaseServer } from "@/lib/supabaseServer";

// Verify payment signature and mark waitlist as paid
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
  } = body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    email: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
  }

  const generated_signature = crypto
    .createHmac("sha256", key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const supabase = createSupabaseServer();
  const { error } = await supabase
    .from("waitlist")
    .update({ status: "paid" })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
