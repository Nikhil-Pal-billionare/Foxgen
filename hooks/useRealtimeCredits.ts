"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export function useRealtimeCredits(userId?: string) {
  const supabase = createClient();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    let channel: any;

    async function init() {
      // 1️⃣ Fetch initial balance
      const { data } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (data) setCredits(data.balance);

      // 2️⃣ Subscribe to realtime updates
      channel = supabase
        .channel("credits-realtime")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "credits",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setCredits(payload.new.balance);
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  return credits;
}
