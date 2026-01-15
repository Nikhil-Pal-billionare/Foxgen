import { createClient } from "@/lib/supabaseServer";

export default async function AdminReferrals() {
  const supabase = createClient();

  const { data } = await supabase
    .from("referrals")
    .select("code, reward, created_at");

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Referrals</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
        {data?.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span>{r.code}</span>
            <span>₹{r.reward}</span>
          </div>
        ))}
      </div>
    </>
  );
}
