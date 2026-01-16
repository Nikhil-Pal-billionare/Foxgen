import StatCard from "@/components/admin/StatCard";
import { createClient } from "@/lib/supabaseServer";

export default async function AdminOverview() {
  const supabase = createClient();

  const since = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    { count: totalUsers },
    { count: activeSubs },
    revenue,
    credits,
  ] = await Promise.all([
    // Total users (all-time, usually correct)
    supabase.from("profiles").select("*", {
      count: "exact",
      head: true,
    }),

    // Active subscriptions (current)
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    // 💰 Revenue in last 24h
    supabase
      .from("subscriptions")
      .select("amount")
      .eq("status", "active")
      .gte("created_at", since),

    // 🔥 Credits used in last 24h
    supabase
      .from("credit_logs")
      .select("amount")
      .gte("created_at", since),
  ]);

  const totalRevenue =
    revenue.data?.reduce((sum, r) => sum + r.amount, 0) ?? 0;

  const creditsToday =
    credits.data?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0 },
    { label: "Active Subscriptions", value: activeSubs ?? 0 },
    { label: "Revenue (24h)", value: `₹${totalRevenue}` },
    { label: "Credits Used (24h)", value: creditsToday },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </>
  );
}
