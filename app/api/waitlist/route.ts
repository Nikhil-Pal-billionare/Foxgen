import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseServer } from "@/lib/supabaseServer";

const WaitlistSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().min(6).max(20).optional(),
  role: z.enum(["creator", "editor", "agency"]).optional(),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServer();
  const body = await req.json().catch(() => null);

  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, whatsapp, role } = parsed.data;

  // Upsert by email
  const { data, error } = await supabase
    .from("waitlist")
    .upsert({ email, whatsapp, role, status: "waitlisted" }, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "You’re on the waitlist. Early users will be given huge discounts in batches.",
    entry: data,
  });
}

export async function GET() {
  const supabase = createSupabaseServer();

  const [countRes, listRes] = await Promise.all([
    supabase.from("waitlist").select("id", { count: "exact", head: true }),
    supabase
      .from("waitlist")
      .select("email, status, joined_at, role")
      .order("joined_at", { ascending: false })
      .limit(10),
  ]);

  const count = countRes.count ?? 0;
  const list = listRes.data ?? [];
  const error = countRes.error || listRes.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count, recent: list });
}
