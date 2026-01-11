"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function CreditChip() {
  const supabase = createClient();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      setCredits(data?.balance ?? 0);
    };

    fetchCredits();

    const channel = supabase
      .channel("credits-watch")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credits",
        },
        fetchCredits
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 px-5 py-2 rounded-full bg-black/60 border border-white/20 text-sm">
      🔥 {credits} Credits
    </div>
  );
}
