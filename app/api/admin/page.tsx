import { cookies } from "next/headers";

async function getOverview() {
  const res = await fetch("http://localhost:3000/api/admin/overview", {
    credentials: "include",
    headers: { Cookie: cookies().toString() },
  });
  return res.json();
}

export default async function AdminDashboard() {
  const data = await getOverview();

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Users" value={data.users} />
        <Card title="Revenue" value={`₹${data.totalRevenue}`} />
        <Card title="Usage Events" value={data.usageEvents} />
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
