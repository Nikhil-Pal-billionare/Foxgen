import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const WaitlistSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().min(6).max(20).optional(),
  role: z.enum(["creator", "editor", "agency"]).optional(),
});

// Helper to get the best available client
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (serviceKey) {
    return createClient(url, serviceKey);
  }
  // Fallback to anon client (no cookies = anon role)
  // This allows inserting if the RLS policy is "to anon"
  return createClient(url, anonKey);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, whatsapp, role } = parsed.data;

  const supabase = getSupabaseClient();

  // Upsert by email
  const { data, error } = await supabase
    .from("waitlist")
    .upsert({ email, whatsapp, role, status: "waitlisted" }, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    // Check for RLS error when service key is missing
    if (error.code === "42501" && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("RLS Error: Missing SUPABASE_SERVICE_ROLE_KEY or 'waitlist_insert' policy for anon role.");
      return NextResponse.json({ 
        error: "Configuration Error: Please add SUPABASE_SERVICE_ROLE_KEY to .env.local OR run the SQL migration to allow anon inserts." 
      }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "You’re on the waitlist. Early users will be given huge discounts in batches.",
    entry: data,
  });
}

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // If no service key, we can't read stats due to RLS (only service_role can read)
  // Return empty stats to prevent page crash
  if (!serviceKey) {
    return NextResponse.json({ count: 0, recent: [] });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const [countRes, listRes] = await Promise.all([
    supabaseAdmin.from("waitlist").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("waitlist")
      .select("id", { count: "exact", head: true })
      .order("joined_at", { ascending: false })
      .limit(10),
  ]);

  const count = countRes.count ?? 0;
  const list = listRes.data ?? [];
  const error = countRes.error || listRes.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count });
}
