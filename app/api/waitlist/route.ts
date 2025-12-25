import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SCHEMA
========================= */
const WaitlistSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().min(6).max(20).optional(),
  role: z.enum(["creator", "editor", "agency"]).optional(),
  referralCode: z.string().optional(), // 👈 NEW
});

/* =========================
   SUPABASE CLIENT HELPER
========================= */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Prefer service role (server-side only)
  if (serviceKey) {
    return createClient(url, serviceKey);
  }

  // Fallback (requires anon insert RLS policy)
  return createClient(url, anonKey);
}

/* =========================
   POST → JOIN WAITLIST
========================= */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, whatsapp, role, referralCode } = parsed.data;

  // 🎯 Referral logic
  let normalizedCode = referralCode?.trim().toUpperCase() ?? null;
  let discountAmount = 0;

  if (normalizedCode === "AVT100") {
    discountAmount = 100;
  } else {
    normalizedCode = null; // ignore invalid codes silently
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("waitlist")
    .upsert(
      {
        email,
        whatsapp,
        role,
        status: "waitlisted",
        referral_code: normalizedCode,
        discount_amount: discountAmount,
      },
      { onConflict: "email" }
    );

  if (error) {
    // RLS / config clarity
    if (error.code === "42501" && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            "Configuration Error: Please add SUPABASE_SERVICE_ROLE_KEY to .env.local OR allow anon inserts via RLS.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message:
      discountAmount > 0
        ? "You're on the waitlist 🎉 ₹100 discount will be applied when you upgrade."
        : "You're on the waitlist. Early users will get special benefits.",
  });
}

/* =========================
   GET → PUBLIC WAITLIST COUNT
========================= */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    // Fail-safe: never lie
    return NextResponse.json({ count: 0 });
  }

  const supabaseAdmin = createClient(url, serviceKey);

  const { count, error } = await supabaseAdmin
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

