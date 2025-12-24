import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.rpc("usage_per_day");

  return NextResponse.json(data);
}
