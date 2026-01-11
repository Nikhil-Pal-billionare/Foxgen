"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type CreditsContextType = {
  credits: number;
};

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
});

export function CreditsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 🔹 Initial fetch
      const { data } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (data) setCredits(data.balance);

      // 🔴 Realtime updates
      channel = supabase
        .channel("credits-live")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "credits",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setCredits(payload.new.balance);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CreditsContext.Provider value={{ credits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
