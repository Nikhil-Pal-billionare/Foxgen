"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

export default function LaterFootages() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("later_footages")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      setItems(data ?? []);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Later Footages</h1>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {items.map((item) => (
          <div key={item.id} className="border p-4">
            <h2>{item.title}</h2>
            {item.clips?.map((c: any, i: number) => (
              <video
                key={i}
                src={c.video_files?.[0]?.link}
                controls
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

