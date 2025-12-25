import StatCard from "@/components/admin/StatCard";

export default async function AdminOverview() {
  // Later connect real API
  const stats = [
    { label: "Total Users", value: 124 },
    { label: "Active Subscriptions", value: 32 },
    { label: "Monthly Revenue", value: "₹48,000" },
    { label: "Credits Used Today", value: 912 },
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
