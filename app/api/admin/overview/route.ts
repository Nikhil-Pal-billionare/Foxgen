import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { supabase } = await requireAdmin();

  const { count: users } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { data: revenue } = await supabase
    .from("subscriptions")
    .select("amount");

  const totalRevenue =
    revenue?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

  const { count: events } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    users,
    totalRevenue,
    usageEvents: events,
  });
}
