import { createClient } from "@/lib/supabaseServer";

export default async function AdminRevenue() {
  const supabase = createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, amount, created_at")
    .eq("status", "active");

  const revenueByPlan = data?.reduce((acc: any, row) => {
    acc[row.plan] = (acc[row.plan] || 0) + row.amount;
    return acc;
  }, {});

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Revenue</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        {Object.entries(revenueByPlan || {}).map(([plan, amount]) => (
          <div key={plan} className="flex justify-between">
            <span>{plan}</span>
            <span className="font-semibold">₹{amount as number}</span>
          </div>
        ))}
      </div>
    </>
  );
}
