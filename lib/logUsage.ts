import { createClient } from "@/lib/supabaseServer";

export async function logUsage(
  userId: string,
  eventType: string,
  meta = {}
) {
  const supabase = createClient();

  await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: eventType,
    meta,
  });
}
