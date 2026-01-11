"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return user;
}
