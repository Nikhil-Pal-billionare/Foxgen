import { createClient } from "@/lib/supabaseServer";

export default async function AdminUsage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("credit_logs")
    .select("amount, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Usage Analytics</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-2">
        {data?.map((u, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {new Date(u.created_at).toLocaleString()}
            </span>
            <span>{u.amount} credits</span>
          </div>
        ))}
      </div>
    </>
  );
}
